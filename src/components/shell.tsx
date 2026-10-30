import Link from "next/link";
import { io } from "next/cache";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth-forms";
import { currentUser } from "@/lib/current-user";
import { userCount } from "@/lib/auth";

const links = [
  { href: "/flags", label: "Flags" },
  { href: "/audit", label: "Audit" },
  { href: "/settings/keys", label: "API keys" },
  { href: "/settings/team", label: "Team" },
];

export async function AuthedShell({ children }: { children: React.ReactNode }) {
  await io();
  const user = await currentUser();
  if (!user) {
    const count = await userCount();
    redirect(count === 0 ? "/setup" : "/login");
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/flags" className="text-sm font-semibold tracking-[0.18em]">
            PENNANT
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              {user.name}
              <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-xs uppercase tracking-wide">
                {user.role}
              </span>
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 md:grid-cols-[160px_1fr]">
        <nav className="flex gap-4 md:flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
