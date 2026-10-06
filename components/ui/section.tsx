import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type SectionBackground = "cream" | "white" | "gray" | "transparent";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  background?: SectionBackground;
  spacing?: "sm" | "md" | "lg";
}

const bgClasses: Record<SectionBackground, string> = {
  cream: "bg-mogu-cream",
  white: "bg-white",
  gray: "bg-mogu-gray-50",
  transparent: "bg-transparent",
};

const spacingClasses = {
  sm: "py-10 sm:py-12",
  md: "py-14 sm:py-16",
  lg: "py-16 sm:py-20",
};

export function Section({
  children,
  background = "transparent",
  spacing = "md",
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(bgClasses[background], spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </section>
  );
}