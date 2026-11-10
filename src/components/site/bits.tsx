import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { richBlocks } from "@/lib/format";

export function SiteLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  if (to.startsWith("http")) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to as "/"} className={className}>
      {children}
    </Link>
  );
}

const buttonStyles = {
  primary: "bg-primary text-secondary hover:bg-primary-hover",
  dark: "bg-secondary text-background hover:opacity-90",
  ghost: "border border-line bg-background text-secondary hover:border-secondary",
  light: "bg-background text-secondary hover:bg-surface",
} as const;

export function Button({
  to,
  variant = "primary",
  className,
  children,
  type = "button",
  disabled,
  onClick,
}: {
  to?: string;
  variant?: keyof typeof buttonStyles;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const cls = cn(
    "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60",
    buttonStyles[variant],
    className,
  );
  if (to) return <SiteLink to={to} className={cls}>{children}</SiteLink>;
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Highlight({ text, highlight }: { text: string; highlight?: string | null }) {
  if (!highlight) return <>{text}</>;
  const index = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <span className="text-primary">{text.slice(index, index + highlight.length)}</span>
      {text.slice(index + highlight.length)}
    </>
  );
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = richBlocks(text);
  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, index) =>
        block.kind === "h2" ? (
          <h2 key={index} className="font-display text-2xl text-secondary">
            {block.text}
          </h2>
        ) : (
          <p key={index} className="leading-relaxed text-ink-soft">
            {block.text.split("\n").map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="font-display text-2xl text-secondary">{title}</p>
      <p className="mx-auto mt-3 max-w-lg text-ink-soft">{body}</p>
    </div>
  );
}

export function PageIntro({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">{kicker}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl text-secondary md:text-6xl">{title}</h1>
        {lede ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{lede}</p> : null}
      </div>
    </header>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">{children}</p>;
}
