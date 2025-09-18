"use client";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageTitle({
  title,
  subtitle,
  className = ""
}: PageTitleProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      {subtitle && (
        <p className="text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
}
