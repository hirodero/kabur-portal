import Link from "next/link";
import Image from "next/image";

type AccessPath = "zenius" | "telkomsel" | "malaka";

interface SubcourseItem {
  name: string;
  accessPath: AccessPath;
  userProgress: number; // 0–100
}

const REQUIRED_LEVEL = 100;

// Language keywords → zenius
const LANGUAGE_KEYWORDS = [
  "deutsch", "german", "japanese", "korean", "english",
  "bahasa jepang", "bahasa korea", "bahasa inggris", "bahasa jerman",
  "nihongo", "a1", "a2", "b1", "b2", "c1", "language", "bahasa asing",
  "komunikasi dalam bahasa",
];

// Technical/craft-heavy → malaka
const TECHNICAL_KEYWORDS = [
  "cad", "3d", "gambar teknis", "teknis", "konstruksi", "fabrikasi",
  "elektronika", "sirkuit", "esd", "cleanroom", "troubleshoot",
  "pemodelan", "visualisasi", "spesifikasi", "regulasi", "bangunan",
  "material", "tata ruang", "arsitektur", "engineering", "mekanik",
];

function getAccessPath(courseName: string): AccessPath {
  const lower = courseName.toLowerCase();
  if (LANGUAGE_KEYWORDS.some((k) => lower.includes(k))) return "zenius";
  if (TECHNICAL_KEYWORDS.some((k) => lower.includes(k))) return "malaka";
  const hash = courseName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % 2 === 0 ? "telkomsel" : "malaka";
}

// Deterministic mock progress (0–85) so there's always a visible gap
function getMockProgress(courseName: string): number {
  const hash = courseName.split("").reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
  return Math.min(85, (hash % 76) + 5); // range 5–80
}

const ACCESS_PATH_CONFIG: Record<
  AccessPath,
  { label: string; logo: string; href: string; barColor: string; pillBg: string; pillText: string; btnBg: string; btnText: string; btnBorder: string }
> = {
  zenius: {
    label: "Zenius",
    logo: "/zenius.png",
    href: "https://zenius.net",
    barColor: "bg-primary",
    pillBg: "bg-primary-light",
    pillText: "text-primary",
    btnBg: "bg-primary/5 hover:bg-primary/10",
    btnText: "text-primary",
    btnBorder: "border-primary/20",
  },
  telkomsel: {
    label: "Telkomsel",
    logo: "/telkomsel.png",
    href: "https://www.telkomsel.com/learn",
    barColor: "bg-orange-500",
    pillBg: "bg-orange-50",
    pillText: "text-orange-600",
    btnBg: "bg-orange-50 hover:bg-orange-100",
    btnText: "text-orange-600",
    btnBorder: "border-orange-200",
  },
  malaka: {
    label: "Malaka",
    logo: "/malaka.png",
    href: "https://malakainstitute.com",
    barColor: "bg-blue-600",
    pillBg: "bg-blue-50",
    pillText: "text-blue-700",
    btnBg: "bg-blue-50 hover:bg-blue-100",
    btnText: "text-blue-700",
    btnBorder: "border-blue-200",
  },
};

interface SubcoursesPanelProps {
  courses: string[];
}

export function SubcoursesPanel({ courses }: SubcoursesPanelProps) {
  if (!courses || courses.length === 0) return null;

  const items: SubcourseItem[] = courses.map((name) => ({
    name,
    accessPath: getAccessPath(name),
    userProgress: getMockProgress(name),
  }));

  const grouped = {
    zenius: items.filter((i) => i.accessPath === "zenius"),
    telkomsel: items.filter((i) => i.accessPath === "telkomsel"),
    malaka: items.filter((i) => i.accessPath === "malaka"),
  };

  const completedCount = items.filter((i) => i.userProgress >= REQUIRED_LEVEL).length;

  return (
    <div className="bg-white border border-ink/10 rounded-card p-6">
      <div className="flex items-start justify-between mb-1">
        <h2 className="font-jakarta font-bold text-lg text-ink">
          Materi Pelatihan yang Diperlukan
        </h2>
      </div>
      <p className="font-jakarta text-xs text-ink-muted mb-5">
        {completedCount}/{courses.length} materi selesai · melalui mitra pelatihan
      </p>

      <div className="space-y-6">
        {(Object.keys(grouped) as AccessPath[])
          .filter((key) => grouped[key].length > 0)
          .map((key) => {
            const config = ACCESS_PATH_CONFIG[key];
            const list = grouped[key];
            return (
              <div key={key}>
                {/* Provider header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`relative w-8 h-5 rounded border ${config.btnBorder} bg-white overflow-hidden flex items-center justify-center p-0.5`}>
                      <Image
                        src={config.logo}
                        alt={config.label}
                        width={32}
                        height={20}
                        className="object-contain w-full h-full"
                      />
                    </span>
                    <span className="font-jakarta text-xs font-semibold text-ink">
                      {config.label}
                    </span>
                    <span className="font-jakarta text-[10px] text-ink-muted">
                      ({list.length} materi)
                    </span>
                  </div>
                </div>

                {/* Course rows with progress bars */}
                <div className="space-y-3.5">
                  {list.map((item) => {
                    const gap = REQUIRED_LEVEL - item.userProgress;
                    return (
                      <div key={item.name} className="space-y-1.5">
                        {/* Course title + progress count + gap pill */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-jakarta text-xs font-medium text-ink leading-snug">
                            {item.name}
                          </span>
                          <span className={`font-jakarta text-[11px] font-medium ${config.pillText}`}>
                            {item.userProgress}/{REQUIRED_LEVEL}
                          </span>
                          {gap > 0 && (
                            <span className={`font-jakarta text-[10px] font-semibold px-1.5 py-0.5 rounded-badge border ${config.pillBg} ${config.pillText} ${config.btnBorder}`}>
                              -{gap}
                            </span>
                          )}
                        </div>

                        {/* Progress bar + Mulai button on the same row */}
                        <div className="flex items-center gap-3">
                          <div className="relative flex-1 h-1.5 bg-ink/8 rounded-full overflow-visible">
                            <div
                              className={`absolute left-0 top-0 h-full rounded-full ${config.barColor}`}
                              style={{ width: `${item.userProgress}%` }}
                            />
                            <div
                              className="absolute -top-1 w-0.5 h-3.5 bg-ink/30 rounded-full"
                              style={{ left: `${REQUIRED_LEVEL}%` }}
                            />
                          </div>
                          <Link
                            href={`${config.href}/search?q=${encodeURIComponent(item.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`shrink-0 font-jakarta text-[11px] font-semibold px-3 py-1 rounded-lg border ${config.btnBg} ${config.btnText} ${config.btnBorder} transition-colors`}
                          >
                            Mulai →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
