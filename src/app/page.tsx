import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Master Data Structures & Algorithms
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Track your problem-solving progress, organize topics, and stay consistent.
          Your personal DSA journey starts here.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/register">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
