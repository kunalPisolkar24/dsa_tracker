"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface UserNavProps {
  name: string;
  email: string;
}

export function UserNav({ name, email }: UserNavProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline text-muted-foreground">{name || email}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
