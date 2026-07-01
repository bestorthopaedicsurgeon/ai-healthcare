import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const footerGroups = [
  {
    title: "Landing",
    links: [
      { label: "Workflow", href: "/#how-it-works" },
      { label: "Modules", href: "/#modules" },
      { label: "Security", href: "/#security" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Referral triage", href: "/triage" },
      { label: "Voice intake", href: "/voice-agent" },
      { label: "Scribe", href: "/scribe" },
      { label: "Chat", href: "/chat" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Start trial", href: "/signup" },
      { label: "Log in", href: "/login" },
    ],
  },
];

const socialIcons = [
  { label: "Facebook", icon: Facebook },
  { label: "LinkedIn", icon: Linkedin },
  { label: "Instagram", icon: Instagram },
  { label: "Twitter", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo className="mb-4" />
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              AI workflow platform for referrals, intake, clinical notes, and
              follow-up across modern clinics.
            </p>

            <div className="mt-6">
              <a
                href="mailto:support@clinaxy.com"
                className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-teal-700"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-canvas text-muted transition-colors group-hover:border-teal-300 group-hover:text-teal-700">
                  <Mail size={16} />
                </span>
                <span>
                  For queries or help, contact{" "}
                  <span className="underline decoration-line-strong underline-offset-4">
                    support@clinaxy.com
                  </span>
                </span>
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2">
              {socialIcons.map((social) => {
                const Icon = social.icon;
                return (
                  <span
                    key={social.label}
                    aria-label={social.label}
                    title={`${social.label} link coming soon`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-canvas text-muted"
                  >
                    <Icon size={17} />
                  </span>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted transition-colors hover:text-teal-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Clinaxy. All rights reserved.</p>
          <p>Workflow assistance only. Clinicians review and approve outputs.</p>
        </div>
      </div>
    </footer>
  );
}
