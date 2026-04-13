"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn } from "@/lib/auth";
import { getTopDomain } from "@/lib/utils";

type paths = {
  pathUrl: string;
  type?: "page" | "layout";
};

export async function revalidatePaths(paths: paths[]) {
  for (const path of paths) {
    revalidatePath(path.pathUrl, path.type ?? "page");
  }
}

export async function setCookie(
  key: string,
  value: string,
  options?: {
    maxAge?: number;
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    secure?: boolean;
    domain?: string;
  }
) {
  (await cookies()).set(key, value, options);
}

export async function getCookie(key: string) {
  return (await cookies()).get(key)?.value;
}

export async function deleteCookie(key: string) {
  (await cookies()).delete(key);
}

export async function getAllCookies() {
  return (await cookies()).getAll();
}

export async function clearAllAuthCookies() {
  const cookieStore = await cookies();

  const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://");
  const cookiePrefix = useSecureCookies ? "__Secure-" : "";
  const hostName = getTopDomain(process.env.NEXTAUTH_URL ?? "");
  const cookieDomain =
    hostName && hostName !== "localhost" ? `.${hostName}` : undefined;

  const cookiesToRemove = [
    `${cookiePrefix}authjs.session-token`,
    "authjs.session-token",
    "portal-token",
    "kabur-token",
    "cookie_version",
  ];

  for (const cookieName of cookiesToRemove) {
    try {
      // zenleap-token diset dengan domain (e.g. .zenleap.id) di auth.ts.
      // Cookie dengan domain hanya bisa dihapus jika Set-Cookie punya path + domain yang sama.
      if (cookieName === "kabur-token" && cookieDomain) {
        cookieStore.set(cookieName, "", {
          maxAge: 0,
          path: "/",
          domain: cookieDomain,
          secure: useSecureCookies,
          sameSite: "lax",
        });
      } else {
        cookieStore.delete(cookieName);
      }
    } catch (error) {
      console.error(`Failed to delete cookie: ${cookieName}`, error);
    }
  }
}

export async function signInHandler(email: string, password: string) {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  await signIn("credentials", formData);
  redirect("/recruiter");
}

export async function getCurrentCompanyContext() {
  return (await cookies()).get("currentCompanyId")?.value ?? "";
}
