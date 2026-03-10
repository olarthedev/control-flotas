import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type BreadcrumbItem = string | { label: string; to?: string };

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export function PageHeader({ breadcrumbs, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div className="min-w-[280px] flex-1">
        <nav aria-label="Breadcrumb" className="mb-[18px] flex items-center gap-2 py-0.5 text-[11px] text-slate-400">
          {breadcrumbs.map((crumbItem, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const crumb = typeof crumbItem === 'string' ? { label: crumbItem } : crumbItem;

            return (
              <div key={`${crumb.label}-${index}`} className="inline-flex items-center gap-2">
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="font-medium !text-slate-500 visited:!text-slate-500 transition hover:!text-slate-700"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-medium text-[#5848f4]' : 'font-medium text-slate-500'}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight size={14} className="text-slate-300" />}
              </div>
            );
          })}
        </nav>

        <h1 className="text-[19px] leading-tight font-semibold tracking-tight text-[#0f1f47] sm:text-[20px]">
          {title}
        </h1>
        <p className="mt-3 max-w-[980px] text-[13px] leading-relaxed font-normal text-slate-500 sm:text-[13px]">
          {subtitle}
        </p>
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
