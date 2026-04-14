import NextAuth, { DefaultSession } from "next-auth";
import { JWT as BaseJWT } from "next-auth/jwt";
import { cookies } from "next/headers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { exchangeGoogleIdTokenForPortalCookie } from "@/lib/portal-auth-exchange";

declare module "next-auth" {
  interface User {
    "user-id"?: string;
    email?: string | null;
    name?: string | null;
    "universal-learning-id"?: string;
    picture?: string | null;
    "user-type"?: string;
    "onboarded?"?: boolean;
    "media-partner-id"?: string;
    access_token?: string;
  }

  interface Session {
    user: DefaultSession["user"] & {
      "user-id"?: string;
      "universal-learning-id"?: string;
      "user-type"?: string;
      "onboarded?"?: boolean;
      "media-partner-id"?: string;
    };
    accessToken?: string;
  }

  interface JWT extends BaseJWT {
    "user-id"?: string;
    "universal-learning-id"?: string;
    "user-type"?: string;
    "onboarded?"?: boolean;
    "media-partner-id"?: string;
    accessToken?: string;
    /** Short-lived Google OIDC id_token for portal BFF exchange when cookie mirror is deferred */
    idToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize() {
        // This frontend currently authenticates via Google OAuth.
        // Keep credentials provider to avoid breaking existing calls to signIn("credentials").
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ account }) {
      if (account?.provider !== "google" || !account.id_token) return true;

      const result = await exchangeGoogleIdTokenForPortalCookie(account.id_token);
      if (!result.ok) {
        const params = new URLSearchParams({ error: "portal_auth" });
        return `/login?${params.toString()}`;
      }

      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user["user-id"] = token["user-id"] as string | undefined;
        session.user["universal-learning-id"] = token[
          "universal-learning-id"
        ] as string | undefined;
        session.user["user-type"] = token["user-type"] as string | undefined;
        session.user["onboarded?"] = token["onboarded?"] as boolean | undefined;
        session.user["media-partner-id"] = token[
          "media-partner-id"
        ] as string | undefined;
        session.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
    async jwt({ token, user, account, trigger, session }) {
      const cookieStore = await cookies();
      if (token.idToken && cookieStore.get("portal-token")) {
        delete token.idToken;
      }

      if (
        account?.provider === "google" &&
        account.id_token &&
        !cookieStore.get("portal-token")
      ) {
        token.idToken = account.id_token;
      }

      if (trigger === "update" && session?.user) {
        if (session.user["user-id"]) token["user-id"] = session.user["user-id"];
        if (session.user["universal-learning-id"])
          token["universal-learning-id"] = session.user["universal-learning-id"];
        if (session.user["user-type"]) token["user-type"] = session.user["user-type"];
        if (typeof session.user["onboarded?"] === "boolean")
          token["onboarded?"] = session.user["onboarded?"];
        if (session.user["media-partner-id"])
          token["media-partner-id"] = session.user["media-partner-id"];
      }
      if (session?.accessToken) token.accessToken = session.accessToken;
      if (user?.image) token.picture = user.image;
      return token;
    },
    async redirect({ url, baseUrl }) {
      const safeFallback = `${baseUrl}/home`;
      const isSafePath = (path: string) =>
        path.startsWith("/") &&
        !path.startsWith("/login") &&
        path !== "/signout";

      try {
        const urlObj = new URL(url, baseUrl);
        const callbackUrl = urlObj.searchParams.get("callbackUrl");

        if (callbackUrl) {
          const decodedCallback = decodeURIComponent(callbackUrl);
          if (isSafePath(decodedCallback)) {
            return `${baseUrl}${decodedCallback}`;
          }
        }

        if (urlObj.origin === baseUrl && isSafePath(urlObj.pathname)) {
          return `${baseUrl}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        }
      } catch {
        // Invalid URL, fallback to home
      }

      if (url.startsWith("/") && isSafePath(url)) {
        return `${baseUrl}${url}`;
      }

      return safeFallback;
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
    signOut: "/signout",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
  trustHost: true,
});
