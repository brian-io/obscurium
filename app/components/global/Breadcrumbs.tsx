import Link from 'next/link';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <nav aria-label="Breadcrumbs" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm font-medium">
        {breadcrumbs.map((breadcrumb, i) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={clsx('flex items-center', {
              'text-slate-700': !breadcrumb.active,
              'text-teal-700': breadcrumb.active,
            })}
          >
            {i > 0 && (
              <ChevronRight className="mx-2 h-4 w-4 flex-shrink-0 text-slate-400" />
            )}
            
            {breadcrumb.active ? (
              <span className="relative py-1 px-2 bg-teal-50 rounded-md">
                {breadcrumb.label}
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-200 rounded-full" 
                  aria-hidden="true"
                />
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-teal-600 transition-colors duration-200 ease-in-out py-1 px-2 rounded-md hover:bg-slate-50"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}