import { Suspense } from "react";
import { io } from "next/cache";
import { redirect } from "next/navigation";
import { CreateUserForm, RemoveUserButton } from "@/components/settings-forms";
import { currentUser } from "@/lib/current-user";
import { listTeam } from "@/lib/team";

export const metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading team…</p>}>
      <Team />
    </Suspense>
  );
}

async function Team() {
  await io();
  const user = await currentUser();
  if (!user) redirect("/login");
  const team = await listTeam();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Team</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Admins add teammates directly. Pennant does not send email.
      </p>
      {user.role === "admin" ? (
        <div className="mt-8">
          <CreateUserForm />
        </div>
      ) : (
        <p className="mt-6 text-sm">Only admins can add or remove teammates.</p>
      )}
      <ul className="mt-8 divide-y divide-line border-y border-line text-sm">
        {team.map((member) => (
          <li key={member.id} className="flex items-center justify-between gap-4 py-4">
            <span>
              <span className="font-medium">{member.name}</span>
              <span className="ml-3 text-muted">{member.email}</span>
              <span className="ml-3 uppercase tracking-wide text-muted">{member.role}</span>
            </span>
            {user.role === "admin" && member.id !== user.id ? <RemoveUserButton id={member.id} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
