"use client";

import { useState, useRef, useEffect } from "react";
import type { Job } from "@/types";
import {
  Calendar01Icon,
  UserAdd01Icon,
  MoneyAdd01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "hugeicons-react";
import { ApplyButton } from "@/components/jobs/ApplyButton";

interface FunderModeHeaderProps {
  job: Job;
  postedDate: string;
  deadlineDate: string;
  formattedSalary: string;
}

const QUICK_AMOUNTS = [500_000, 1_000_000, 5_000_000, 10_000_000];

function formatRupiah(n: number) {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".0", "")} jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)} rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function formatRupiahFull(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function FunderModeHeader({
  job,
  postedDate,
  deadlineDate,
  formattedSalary,
}: FunderModeHeaderProps) {
  const [funderMode, setFunderMode] = useState(false);
  const [fundBalance, setFundBalance] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalOpen) {
      setInputValue("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  function handleAddFund() {
    const amount = parseInt(inputValue.replace(/\D/g, ""), 10);
    if (!amount || amount <= 0) return;
    setFundBalance((prev) => prev + amount);
    setModalOpen(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  function handleInputChange(val: string) {
    const digits = val.replace(/\D/g, "");
    setInputValue(digits);
  }

  const totalNeeded = job.salaryMin * 3;
  const fillPct = Math.min(100, (fundBalance / totalNeeded) * 100);

  return (
    <>
      {/* ── FUNDER MODE TOGGLE BAR ── */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setFunderMode((v) => !v)}
          className={`inline-flex items-center gap-2 text-xs font-jakarta font-semibold px-3 py-1.5 rounded-badge border transition-all duration-200 ${
            funderMode
              ? "bg-funded text-white border-funded shadow-sm"
              : "bg-white text-ink-muted border-ink/15 hover:border-ink/30"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              funderMode ? "bg-white" : "bg-ink-faint"
            }`}
          />
          {funderMode ? "Funder Mode aktif" : "Masuk sebagai Funder"}
        </button>

        {funderMode && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-jakarta font-semibold px-3 py-1.5 rounded-badge border border-funded/40 bg-funded/10 text-funded hover:bg-funded/20 transition-colors"
          >
            <MoneyAdd01Icon size={14} />
            Tambah Dana
          </button>
        )}
      </div>

      {/* ── FUNDER BALANCE BANNER ── */}
      {funderMode && (
        <div className="mb-5 bg-funded/8 border border-funded/20 rounded-card p-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="font-jakarta text-xs text-funded font-semibold uppercase tracking-widest mb-1">
                Dana Ditanam
              </p>
              <p
                className={`font-jakarta font-bold text-2xl transition-all duration-300 ${
                  justAdded ? "text-funded scale-105" : "text-funded"
                }`}
              >
                {formatRupiahFull(fundBalance)}
              </p>
              {justAdded && (
                <p className="font-jakarta text-xs text-funded flex items-center gap-1 mt-0.5">
                  <CheckmarkCircle02Icon size={12} />
                  Dana berhasil ditambahkan!
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-jakarta text-xs text-ink-muted mb-0.5">Target dana</p>
              <p className="font-jakarta text-sm font-semibold text-ink">
                {formatRupiahFull(totalNeeded)}
              </p>
              <p className="font-jakarta text-[10px] text-ink-muted mt-0.5">
                (3 bulan gaji min.)
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-funded/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-funded rounded-full transition-all duration-700"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="font-jakarta text-[10px] text-ink-muted mt-1.5 text-right">
            {fillPct.toFixed(1)}% dari target
          </p>
        </div>
      )}

      {/* ── HEADER BODY ── */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left info */}
        <div className="flex-1">
          <h1 className="font-jakarta font-bold text-2xl sm:text-3xl text-ink mb-1">
            {job.title}
          </h1>
          <p className="font-jakarta text-base text-ink-muted mb-4">{job.company}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="font-jakarta text-xs bg-app-bg text-ink-muted px-2 py-1 rounded-badge font-medium">
              via {job.offTaker}
            </span>
            <span className="font-jakarta text-xs bg-app-bg text-ink-muted px-2 py-1 rounded-badge font-medium">
              {job.sector}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 font-jakarta text-sm text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Calendar01Icon size={14} />
              Diposting {postedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <UserAdd01Icon size={14} />
              Deadline {deadlineDate}
            </span>
          </div>
        </div>

        {/* Right: salary + actions */}
        <div className="flex flex-col items-start lg:items-end gap-4">
          <div className="lg:text-right">
            <p className="font-jakarta text-xs text-ink-muted mb-1">Gaji</p>
            <p className="font-jakarta font-bold text-2xl text-primary">{formattedSalary}</p>
            <p className="font-jakarta text-sm text-ink-muted mt-0.5">
              {job.placement
                ? `📍 ${job.placement.city}, ${job.placement.country}`
                : `${job.countryFlag} ${job.country}`}
            </p>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <ApplyButton job={job} size="default" className="flex-1 lg:flex-none lg:w-36" />
          </div>
        </div>
      </div>

      {/* ── ADD FUND MODAL ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-white rounded-card shadow-card-hover w-full max-w-sm p-6 relative">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-ink-muted hover:text-ink transition-colors"
              aria-label="Tutup"
            >
              <Cancel01Icon size={18} />
            </button>

            <h2 className="font-jakarta font-bold text-lg text-ink mb-1">Tambah Dana</h2>
            <p className="font-jakarta text-sm text-ink-muted mb-5">
              Dana akan ditanam untuk lowongan{" "}
              <span className="font-semibold text-ink">{job.title}</span>.
            </p>

            {/* Quick pick */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInputValue(String(amt))}
                  className={`font-jakarta text-xs px-2.5 py-1.5 rounded-badge border transition-colors ${
                    inputValue === String(amt)
                      ? "bg-funded text-white border-funded"
                      : "border-ink/15 text-ink-muted hover:border-funded/50 hover:text-funded"
                  }`}
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>

            {/* Custom amount input */}
            <div className="mb-5">
              <label className="font-jakarta text-xs text-ink-muted mb-1.5 block">
                Jumlah lain (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-jakarta text-sm text-ink-muted">
                  Rp
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={
                    inputValue
                      ? parseInt(inputValue, 10).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-2.5 border border-ink/20 rounded-card font-jakarta text-sm text-ink focus:outline-none focus:border-funded focus:ring-1 focus:ring-funded/30 transition-colors"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddFund}
              disabled={!inputValue || parseInt(inputValue, 10) <= 0}
              className="w-full bg-funded text-white font-jakarta font-semibold text-sm py-2.5 rounded-card hover:bg-funded-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Konfirmasi Dana
            </button>
          </div>
        </div>
      )}
    </>
  );
}
