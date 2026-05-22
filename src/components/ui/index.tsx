import Link, { type LinkProps } from "next/link";
import clsx from "clsx";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
} from "react";

type PageWidth = "default" | "narrow" | "wide" | "full";

type PageProps = HTMLAttributes<HTMLDivElement> & {
  width?: PageWidth;
};

const pageWidthClasses: Record<PageWidth, string> = {
  default: "ui-page",
  narrow: "ui-page ui-page-narrow",
  wide: "ui-page ui-page-wide",
  full: "ui-page ui-page-full",
};

export function Page({ children, className, width = "default", ...props }: PageProps) {
  return (
    <div className={clsx(pageWidthClasses[width], className)} {...props}>
      {children}
    </div>
  );
}

type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  actions?: ReactNode;
  description?: ReactNode;
  kicker?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  actions,
  className,
  description,
  kicker,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header className={clsx("ui-page-header", className)} {...props}>
      <div className="ui-page-header-copy">
        {kicker && <p className="ui-page-kicker">{kicker}</p>}
        <h1 className="ui-page-title">{title}</h1>
        {description && <div className="ui-page-dek">{description}</div>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  );
}

type ButtonVariant = "default" | "primary" | "danger";

export function buttonClassName(variant: ButtonVariant = "default", className?: string) {
  return clsx(
    "ui-button",
    variant === "primary" && "ui-button-primary",
    variant === "danger" && "ui-button-danger",
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, type = "button", variant = "default", ...props }: ButtonProps) {
  return <button className={buttonClassName(variant, className)} type={type} {...props} />;
}

type LinkButtonProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: ButtonVariant;
  };

export function LinkButton({ className, variant = "default", ...props }: LinkButtonProps) {
  return <Link className={buttonClassName(variant, className)} {...props} />;
}

type TabsProps = HTMLAttributes<HTMLElement> & {
  label?: string;
};

export function Tabs({ children, className, label = "Sections", ...props }: TabsProps) {
  return (
    <nav className={clsx("article-tabbar", className)} aria-label={label} role="tablist" {...props}>
      {children}
    </nav>
  );
}

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function TabButton({ active = false, className, type = "button", ...props }: TabButtonProps) {
  return (
    <button
      aria-selected={active}
      className={clsx("article-tab", active && "article-tab-active", className)}
      role="tab"
      type={type}
      {...props}
    />
  );
}

type TabLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    active?: boolean;
  };

export function TabLink({ active = false, className, ...props }: TabLinkProps) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      aria-selected={active}
      className={clsx("article-tab", active && "article-tab-active", className)}
      role="tab"
      {...props}
    />
  );
}

type SectionPanelProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  bodyClassName?: string;
  title?: ReactNode;
};

type SectionProps = HTMLAttributes<HTMLElement> & {
  actions?: ReactNode;
  title?: ReactNode;
};

export function Section({ actions, children, className, title, ...props }: SectionProps) {
  return (
    <section className={clsx("ui-section", className)} {...props}>
      {(title || actions) && (
        <div className="ui-section-header">
          {title && <h2 className="ui-section-title">{title}</h2>}
          {actions && <div className="ui-section-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function SectionPanel({
  actions,
  bodyClassName,
  children,
  className,
  title,
  ...props
}: SectionPanelProps) {
  return (
    <section className={clsx("wiki-portal", className)} {...props}>
      {title && (
        <div className="wiki-portal-header">
          <span>{title}</span>
          {actions}
        </div>
      )}
      <div className={clsx("wiki-portal-body", bodyClassName)}>{children}</div>
    </section>
  );
}

type DataTableProps = TableHTMLAttributes<HTMLTableElement>;

export function DataTable({ className, ...props }: DataTableProps) {
  return <table className={clsx("ui-table", className)} {...props} />;
}

type EmptyStateProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  actions?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
};

export function EmptyState({
  actions,
  children,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={clsx("ui-empty-state", className)} {...props}>
      {icon && (
        <div className="ui-empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <div className="ui-empty-state-title">{title}</div>}
      {description && <div className="ui-empty-state-description">{description}</div>}
      {children}
      {actions && <div className="ui-empty-state-actions">{actions}</div>}
    </div>
  );
}

type StatGridProps = HTMLAttributes<HTMLDivElement>;

export function StatGrid({ className, ...props }: StatGridProps) {
  return <div className={clsx("ui-stat-grid", className)} {...props} />;
}

type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  detail?: ReactNode;
  label: ReactNode;
  value: ReactNode;
};

export function StatCard({ className, detail, label, value, ...props }: StatCardProps) {
  return (
    <div className={clsx("ui-stat-card", className)} {...props}>
      <div className="ui-stat-card-value">{value}</div>
      <div className="ui-stat-card-label">{label}</div>
      {detail && <div className="ui-stat-card-detail">{detail}</div>}
    </div>
  );
}

type CardGridProps = HTMLAttributes<HTMLDivElement>;

export function CardGrid({ className, ...props }: CardGridProps) {
  return <div className={clsx("ui-card-grid", className)} {...props} />;
}

type CardLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps | "title"> & {
    description?: ReactNode;
    meta?: ReactNode;
    title: ReactNode;
  };

export function CardLink({ className, description, meta, title, ...props }: CardLinkProps) {
  return (
    <Link className={clsx("ui-card-link", className)} {...props}>
      <span className="ui-card-title">{title}</span>
      {description && <span className="ui-card-description">{description}</span>}
      {meta && <span className="ui-card-meta">{meta}</span>}
    </Link>
  );
}
