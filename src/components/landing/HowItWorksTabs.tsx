"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import {
  Search01Icon,
  CheckmarkCircle02Icon,
  DocumentAttachmentIcon,
  UserAdd01Icon,
  BarChartIcon,
  ChartHistogramIcon,
  MoneyBag01Icon,
  FolderCheckIcon,
  CheckListIcon,
  Briefcase01Icon,
  UserListIcon,
  DeliveryTracking01Icon,
} from "hugeicons-react";

const TABS = [
  {
    id: "pmi",
    label: "PMI",
    steps: [
      {
        icon: Search01Icon,
        number: "01",
        title: "Browse Lowongan",
        desc: "Temukan ribuan lowongan kerja luar negeri terverifikasi dari berbagai negara tujuan.",
      },
      {
        icon: CheckmarkCircle02Icon,
        number: "02",
        title: "Cek Skill Gap",
        desc: "Bandingkan skill kamu dengan persyaratan. Jika ada gap, tingkatkan via ZenLeap.",
      },
      {
        icon: DocumentAttachmentIcon,
        number: "03",
        title: "Apply dengan Dukungan",
        desc: "Ajukan lamaran dengan dukungan APJATI atau Vokati — transparan dan terpercaya.",
      },
    ],
  },
  {
    id: "mp",
    label: "Mitra",
    steps: [
      {
        icon: UserAdd01Icon,
        number: "01",
        title: "Daftar Mitra",
        desc: "Daftarkan brand Anda sebagai Marketing Partner dan bangun channel PMI berbranding.",
      },
      {
        icon: BarChartIcon,
        number: "02",
        title: "Branded Channel",
        desc: "Tampilkan lowongan, program, dan konten edukatif di bawah nama brand Anda.",
      },
      {
        icon: ChartHistogramIcon,
        number: "03",
        title: "Lacak Referral",
        desc: "Pantau berapa PMI yang mendaftar via channel Anda dan dampaknya secara real-time.",
      },
    ],
  },
  {
    id: "offtaker",
    label: "Offtaker",
    steps: [
      {
        icon: Briefcase01Icon,
        number: "01",
        title: "Pasang Lowongan",
        desc: "Publikasikan kebutuhan tenaga kerja Anda, sistem kami langsung mencocokkan dengan kandidat yang punya skill relevan.",
      },
      {
        icon: UserListIcon,
        number: "02",
        title: "Seleksi Kandidat Terverifikasi",
        desc: "Akses pool PMI yang sudah terlatih, tersertifikasi, dan siap ditempatkan, lengkap dengan skill match score.",
      },
      {
        icon: DeliveryTracking01Icon,
        number: "03",
        title: "Pantau Penempatan",
        desc: "Ikuti perkembangan kandidat Anda: dari persiapan dokumen, pelatihan, hingga siap diberangkatkan ke lokasi penempatan.",
      },
    ],
  },
  {
    id: "funder",
    label: "Funder",
    steps: [
      {
        icon: MoneyBag01Icon,
        number: "01",
        title: "Buat Program Beasiswa",
        desc: "Subsidi biaya pelatihan PMI — pemerintah, korporat, atau dana negara tujuan.",
      },
      {
        icon: FolderCheckIcon,
        number: "02",
        title: "Pantau Dampak",
        desc: "Lihat jumlah PMI yang mendapat manfaat, sektor yang dibantu, dan progres penempatan.",
      },
      {
        icon: CheckListIcon,
        number: "03",
        title: "Laporan Transparansi",
        desc: "Unduh laporan penggunaan dana yang detail dan dapat diverifikasi kapan saja.",
      },
    ],
  },
] as const;

export function HowItWorksTabs() {
  const [active, setActive] = useState<"pmi" | "mp" | "offtaker" | "funder">("pmi");
  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <div>
      {/* Underline-style tab nav */}
      <div className="flex border-b border-ink/10 mb-10">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant="light"
            color={active === tab.id ? "primary" : "default"}
            size="sm"
            onClick={() => setActive(tab.id as "pmi" | "mp" | "offtaker" | "funder")}
            className={`font-jakarta text-sm font-medium px-0 py-3 mr-8 min-w-0 h-auto rounded-none border-b-2 transition-all duration-150 ${
              active === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Steps — horizontal timeline on desktop */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Full-width connecting line, vertically centered on the number row (leading ~20px / 2 = 10px) */}
        <div className="hidden md:block absolute top-[10px] left-0 right-0 h-px bg-[#E8E6E1]" />

        {activeTab.steps.map((step) => (
          <div key={step.title} className="relative flex flex-col gap-3">
            {/* Number sits on top of the line — white bg clips the line behind it */}
            <span className="font-jakarta text-sm font-semibold text-primary relative z-10 bg-[#F0EDE8] w-fit pr-3">
              {step.number}
            </span>
            <div>
              <h4 className="font-jakarta font-medium text-base text-ink">
                {step.title}
              </h4>
              <p className="text-sm text-ink-muted mt-1 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
