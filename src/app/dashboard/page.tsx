import { getAuth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { UserNav } from "@/components/auth/user-nav";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await getAuth().getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight">DSA Tracker</h1>
          <UserNav
            name={session.user.name ?? ""}
            email={session.user.email ?? ""}
          />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome, {session.user.name ?? "Tracker"}!
          </h2>
          <p className="mt-2 text-muted-foreground">
            Your DSA journey starts here. Start adding problems and tracking your progress.
          </p>
        </div>
      </main>
    </div>
  );
}
