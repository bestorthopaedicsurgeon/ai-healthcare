import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Documentation", href: "#" },
  ],
  Solutions: [
    { label: "Family Medicine", href: "#" },
    { label: "Specialists", href: "#" },
    { label: "Mental Health", href: "#" },
    { label: "Allied Health", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "HIPAA Compliance", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[#d4c4c9]/40 py-16 bg-[#f9f4f1]/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#28030f] flex items-center justify-center">
                <span className="font-bold text-xs text-white">C</span>
              </div>
              <span className="font-semibold text-[#28030f]">
                Cliniq<span className="text-[#755760]">AI</span>
              </span>
            </Link>
            <p className="text-xs text-[#755760] leading-relaxed max-w-[200px]">
              The AI platform for modern healthcare. Documentation, triage, and
              compliance — all in one place.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-[#28030f] uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#755760] hover:text-[#28030f] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 py-6 border-t border-[#d4c4c9]/40 mb-6">
          {["HIPAA", "ADHA", "SOC 2", "ISO 27001", "GDPR"].map((badge) => (
            <span
              key={badge}
              className="text-[10px] font-medium uppercase tracking-wider text-[#755760] px-3 py-1.5 rounded-full border border-[#d4c4c9]/40"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#755760]">
            &copy; {new Date().getFullYear()} CliniqAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-[#755760] hover:text-[#28030f] transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
