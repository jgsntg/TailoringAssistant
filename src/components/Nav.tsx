'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/resume', label: 'Base Resume' },
  { href: '/tailor', label: 'New Tailoring' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="mx-auto max-w-4xl px-6 flex items-center gap-2 h-14">
        <span className="font-bold text-white mr-4 tracking-tight">Resume Tailor</span>
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
