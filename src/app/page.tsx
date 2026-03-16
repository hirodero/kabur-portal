"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";
import { JobCard } from "@/components/jobs/JobCard";
import { MPCard } from "@/components/mp/MPCard";
import { HowItWorksTabs } from "@/components/landing/HowItWorksTabs";
import { Globe } from "@/components/ui/Globe";
import { JOBS, MARKETING_PARTNERS } from "@/lib/mock-data";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const STATS = [
  { value: "12.847", label: "PMI Terdaftar" },
  { value: "2", label: "Mitra Aktif" },
  { value: "284", label: "Lowongan Tersedia" },
  { value: "68", label: "Berhasil Ditempatkan" },
];

export default function LandingPage() {
  useScrollReveal();
  const featuredJobs = JOBS.filter((j) => j.isFunded || j.mpChannel).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNav />

      {/* ── SECTION 1: HERO ── */}
      <section
        className="grain relative overflow-hidden flex flex-col min-h-screen"
        style={{
          background: '#1A1A18',
          backgroundImage: 'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(200,16,46,0.18) 0%, transparent 70%)',
        }}
      >
        {/* Desktop globe - kuadran kiri atas globe nempel di pojok kanan bawah section */}
        <div className="hidden lg:block absolute bottom-0 right-0 pointer-events-none z-10 overflow-hidden"
          style={{ width: 'min(52vw, 600px)', height: 'min(52vw, 600px)' }}
        >
          <div className="absolute bottom-0 right-0 pointer-events-auto"
            style={{ width: 'min(104vw, 1200px)', height: 'min(104vw, 1200px)', transform: 'translate(50%, 50%)' }}
          >
            <Globe />
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12 max-w-7xl mx-auto px-5 sm:px-8 py-24 lg:py-16 w-full">
          {/* Left: Content */}
          <div className="flex flex-col justify-center max-w-4xl lg:max-w-xl">
            {/* Eyebrow */}
            <div className="reveal">
              <p className="font-jakarta text-xs tracking-widest text-white/40 uppercase mb-6">
                Ekosistem PMI · Resmi · Terpercaya
              </p>
            </div>

            {/* Headline */}
            <div className="reveal reveal-delay-1">
              <h1 className="font-jakarta font-bold text-display-xl text-white leading-none">
                Dari Indonesia,
                <br />
                untuk{" "}
                <span className="text-primary">Dunia.</span>
              </h1>
            </div>

            {/* Subtext */}
            <div className="reveal reveal-delay-2">
              <p className="font-jakarta text-base text-white/60 max-w-lg leading-relaxed mt-8">
                Platform resmi yang menghubungkan pekerja migran Indonesia
                dengan peluang kerja global — bersama mitra terpercaya.
              </p>
            </div>

            {/* CTA row */}
            <div className="reveal reveal-delay-3 mt-12 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link
                href="/home"
                className="font-jakarta font-medium text-sm bg-primary text-white px-8 py-3.5 rounded-btn hover:bg-primary-dark transition-colors duration-200 active:scale-[0.97]"
              >
                Lihat Lowongan
              </Link>
              <Button
                variant="light"
                size="md"
                onClick={() => {
                  document.getElementById('tentang')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="font-jakarta text-sm text-white/60 underline underline-offset-4 hover:text-white"
              >
                Pelajari lebih lanjut ↓
              </Button>
            </div>

            {/* Scroll indicator - desktop */}
            <div className="mt-20 hidden sm:flex justify-start">
              <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce-slow" />
            </div>
          </div>

          {/* Center bottom (mobile): Globe - 2/4 (kuadran 1+2, bagian atas) */}
          <div className="flex lg:hidden justify-center items-end pt-4 pb-8 overflow-hidden">
            <div className="relative w-[min(85vw,340px)] h-[min(42.5vw,170px)]">
              <div className="absolute left-0 top-0 w-[min(85vw,340px)] h-[min(85vw,340px)]">
                <Globe />
              </div>
            </div>
          </div>

          {/* Scroll indicator - mobile */}
          <div className="flex sm:hidden justify-center pb-4">
            <div className="w-1 h-1 bg-white/30 rounded-full animate-bounce-slow" />
          </div>
        </div>
      </section>

      {/* ── SECTION 2: STATS STRIP ── */}
      <section className="py-16" style={{ backgroundColor: '#F9F7F4' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="reveal grid grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, idx) => (
              <div
                key={stat.label}
                className={`px-6 py-4 ${
                  idx < 3 ? "border-r border-ink/10" : ""
                }`}
              >
                <p className="stat-number font-jakarta text-5xl font-bold text-ink tracking-tight">
                  {stat.value}
                </p>
                <p className="font-jakarta text-sm text-ink-muted mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section id="tentang" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="reveal max-w-xl mb-12">
            <p className="font-jakarta text-xs uppercase tracking-widest text-ink-muted mb-3">
              Bagaimana ini bekerja
            </p>
            <h2 className="font-jakarta text-display-md text-ink">
              Satu platform,{" "}
              <em className="not-italic">empat</em> aktor,
              <br />
              satu tujuan.
            </h2>
          </div>
          <div className="reveal reveal-delay-1">
            <HowItWorksTabs />
          </div>
        </div>
      </section>

      {/* ── SECTION 4: PARTNER BRANDS ── */}
      <section id="partner" className="py-20" style={{ backgroundColor: '#F0EDE8' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="reveal mb-10">
            <p className="font-jakarta text-xs uppercase tracking-widest text-ink-muted mb-3">
              Diperkuat oleh
            </p>
            <h2 className="font-jakarta text-display-md text-ink">
              Mitra terpercaya
            </h2>
          </div>
          <div className="reveal reveal-delay-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {MARKETING_PARTNERS.map((mp) => (
              <MPCard key={mp.id} partner={mp} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FEATURED JOBS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="reveal flex items-end justify-between mb-12">
            <h2 className="font-jakarta text-display-md text-ink leading-none">
              Lowongan
              <br />
              terbaru
            </h2>
            <Link
              href="/home"
              className="font-jakarta text-sm text-primary hover:underline hidden sm:block"
            >
              Lihat semua →
            </Link>
          </div>

          <div className="reveal reveal-delay-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="mt-6 sm:hidden text-center">
            <Link href="/home" className="font-jakarta text-sm text-primary">
              Lihat semua →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: CTA BAND ── */}
      <section
        className="grain relative overflow-hidden py-28"
        style={{ backgroundColor: '#8B0000' }}
      >
        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <div className="reveal">
            <p className="font-jakarta text-xs uppercase tracking-widest text-white/50 mb-4">
              Program Subsidi Aktif
            </p>
            <h2 className="font-jakarta text-display-lg text-white">
              Biaya training bisa
              <br />
              100% gratis.
            </h2>
            <p className="font-jakarta text-base text-white/70 mt-4 max-w-md mx-auto leading-relaxed">
              Didanai oleh program pemerintah dan CSR korporat — ratusan PMI
              sudah mendapat subsidi penuh untuk pelatihan dan penempatan kerja.
            </p>
            <Link
              href="/home?funded=true"
              className="inline-block font-jakarta font-medium text-sm bg-white text-ink px-8 py-3.5 rounded-btn mt-8 hover:bg-parchment transition-colors duration-200 active:scale-[0.97]"
            >
              Cek kelayakan saya →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: FOOTER ── */}
      <Footer />
    </div>
  );
}
