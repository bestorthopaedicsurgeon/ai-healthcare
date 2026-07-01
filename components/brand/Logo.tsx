import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Clinaxy brand mark — the four-petal "care" symbol with a central spark.
 * Paths are taken verbatim from the official brand SVGs so the mark is pixel-accurate,
 * but rendered inline so it can be recolored / animated.
 */
export function ClinaxySymbol({
  className,
  petalColor = "#1C2A27",
  starColor = "#0E8A7D",
  title = "Clinaxy",
}: {
  className?: string;
  petalColor?: string;
  starColor?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      {[0, 90, 180, 270].map((deg) => (
        <path
          key={deg}
          d="M70.3 70.3 Q91 50 100 22 Q109 50 129.7 70.3"
          transform={`rotate(${deg} 100 100)`}
          stroke={petalColor}
          strokeWidth={18}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <path
        d="M100 60 L110.6 89.4 L140 100 L110.6 110.6 L100 140 L89.4 110.6 L60 100 L89.4 89.4 Z"
        fill={starColor}
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  reversed = false,
  withWordmark = true,
  className,
  symbolClassName,
}: {
  href?: string | null;
  reversed?: boolean;
  withWordmark?: boolean;
  className?: string;
  symbolClassName?: string;
}) {
  const content = (
    <span className={cn("flex items-center gap-2.5", className)}>
      <ClinaxySymbol
        className={cn("h-8 w-8 shrink-0", symbolClassName)}
        petalColor={reversed ? "#FFFFFF" : "#1C2A27"}
        starColor={reversed ? "#7FBDB4" : "#0E8A7D"}
      />
      {withWordmark && (
        <span
          className={cn(
            "font-display text-[19px] font-semibold tracking-tight",
            reversed ? "text-white" : "text-ink"
          )}
          style={{ fontFamily: "var(--font-display)" }}
        >
          Clinaxy
        </span>
      )}
    </span>
  );

  if (href === null) return content;

  return (
    <Link href={href} aria-label="Clinaxy home" className="inline-flex">
      {content}
    </Link>
  );
}
