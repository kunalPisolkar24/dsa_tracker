import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome, {session?.user?.name ?? "Tracker"}!
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your DSA journey starts here. Start adding problems and tracking your progress.
        </p>
      </div>
    </div>
  );
}
