import React from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function PageTitle({ title, subtitle, align = "left" }: PageTitleProps) {
  return (
    <div className={`space-y-2 ${align === "center" ? "text-center" : ""}`}>
      <h1 className="text-3xl font-bold font-display tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground max-w-[85ch]">
          {subtitle}
        </p>
      )}
    </div>
  );
}