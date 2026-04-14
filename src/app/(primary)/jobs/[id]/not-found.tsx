import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";

export default function JobDetailNotFound() {
  return (
    <AppLayout layoutMode="topnav">
      <div className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <p className="font-jakarta text-xs font-semibold uppercase tracking-wide text-ink-muted">
          404
        </p>
        <h1 className="mt-2 font-jakarta text-2xl font-bold text-ink">
          Lowongan tidak ditemukan
        </h1>
        <p className="mt-3 font-jakarta text-sm leading-relaxed text-ink-muted">
          Backend tidak punya dokumen untuk ID di URL ini. Pastikan kamu pakai{" "}
          <span className="font-medium text-ink">_id</span> persis dari API (biasanya 24 karakter
          hex Mongo), atau buka posisi lewat daftar lowongan.
        </p>
        <Link
          href="/jobs"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-jakarta text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
        >
          Kembali ke daftar lowongan
        </Link>
      </div>
    </AppLayout>
  );
}
