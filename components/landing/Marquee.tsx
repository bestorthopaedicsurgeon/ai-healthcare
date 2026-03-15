const items = [
  "Ambient Scribe",
  "Referral Triage",
  "Voice Intake",
  "HIPAA Compliant",
  "EHR Integration",
  "Real-Time Notes",
  "Multi-Language",
  "ADHA Certified",
  "SOC 2",
  "Clinical AI",
  "Smart Routing",
  "Audit Logging",
];

export function Marquee() {
  const doubled = [...items, ...items];

  return (
    <section className="py-10 overflow-hidden border-y border-[#d4c4c9]/20">
      <div className="animate-marquee flex w-max gap-6">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 text-sm text-[#755760] whitespace-nowrap px-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#fdf444]" />
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
