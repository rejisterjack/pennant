import { NewFlagForm } from "@/components/flag-editor";

export const metadata = { title: "New flag" };

export default function NewFlagPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">New flag</h1>
      <p className="mt-2 text-sm text-muted">Keys are what the SDK checks. They cannot be renamed.</p>
      <div className="mt-8">
        <NewFlagForm />
      </div>
    </div>
  );
}
