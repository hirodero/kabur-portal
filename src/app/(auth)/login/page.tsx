"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AuthorizationPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleLogin() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/jobs" });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#F0EDE8]">
      <section className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
        <Link
          href="/detail"
          className="inline-flex text-sm text-ink-muted hover:text-ink transition-colors"
        >
          ← Back
        </Link>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">
            Login
          </p>
          <h1 className="mt-2 font-jakarta text-2xl font-bold text-ink">
            Masuk ke #KaburPortal
          </h1>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-medium text-ink hover:bg-black/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Image
            src="/google-icon-flaticon.png"
            alt="Google icon"
            width={20}
            height={20}
            className="h-5 w-5"
            loading="lazy"
          />
          {loading ? "Mengarahkan..." : "Lanjutkan dengan Google"}
        </button>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Dengan masuk, kamu menyetujui syarat penggunaan platform.
        </p>
      </section>
    </main>
  );
}
