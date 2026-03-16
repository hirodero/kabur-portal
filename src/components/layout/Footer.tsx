import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const navLinks = [
    { label: "Tentang Kami", href: "/#tentang" },
    { label: "Lowongan", href: "/home" },
    { label: "Untuk Partner", href: "/#partner" },
    { label: "Kebijakan Privasi", href: "#" },
  ];

  const partners = [
    { logo: "/zenius.png", label: "Zenius" },
    { logo: "/telkomsel.png", label: "Telkomsel" },
  ];

  return (
    <footer style={{ backgroundColor: '#1A1A18' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand + tagline */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="font-jakarta font-bold text-xl text-white tracking-tight">
              #Kabur<span className="text-primary">Portal</span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Platform resmi ekosistem kerja luar negeri untuk pekerja migran Indonesia.
            </p>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-jakarta font-semibold text-xs uppercase tracking-widest text-white/40 mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 hover:text-white/80 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mitra */}
          <div>
            <h4 className="font-jakarta font-semibold text-xs uppercase tracking-widest text-white/40 mb-4">
              Mitra Platform
            </h4>
            <div className="flex flex-col gap-3">
              {partners.map((mp) => (
                <div key={mp.label} className="flex items-center gap-2.5">
                  <span className="relative w-12 h-7 rounded border border-ink/10 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <Image
                      src={mp.logo}
                      alt={mp.label}
                      width={40}
                      height={20}
                      className="object-contain w-full h-full"
                    />
                  </span>
                  <span className="text-sm text-white/50">{mp.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Off-taker logos */}
          <div>
            <h4 className="font-jakarta font-semibold text-xs uppercase tracking-widest text-white/40 mb-4">
              Dukungan
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative w-12 h-7 rounded border border-ink/10 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <Image
                    src="/vokati-logo.png"
                    alt="Vokati"
                    width={40}
                    height={20}
                    className="object-contain w-full h-full"
                  />
                </span>
                <span className="text-sm text-white/50">Vokati</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="relative w-12 h-7 rounded border border-ink/10 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <Image
                    src="/apjati-logo.png"
                    alt="APJATI"
                    width={40}
                    height={20}
                    className="object-contain w-full h-full"
                  />
                </span>
                <span className="text-sm text-white/50">APJATI</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2025 #KaburPortal. Hak cipta dilindungi.</p>
          <p className="text-xs text-white/30">
            Didukung oleh Vokati &amp; APJATI
          </p>
        </div>
      </div>
    </footer>
  );
}
