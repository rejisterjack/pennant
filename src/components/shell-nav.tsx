"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/flags", label: "Flags" },
  { href: "/audit", label: "Audit" },
  { href: "/settings/keys", label: "API keys" },
  { href: "/settings/team", label: "Team" },
];

export function ShellNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-4 md:flex-col">
      {links.map((link) => {
        const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={
              current
                ? "text-sm font-medium text-accent outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                : "text-sm font-medium hover:text-accent outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
