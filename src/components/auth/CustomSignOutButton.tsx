"use client";

import { useClerk } from "@clerk/nextjs";
import { IconLogout } from "@tabler/icons-react";

export default function CustomSignOutButton() {
  const { signOut } = useClerk();

  return (
    <button
      className="flex items-center gap-2"
      onClick={() => signOut({ redirectUrl: "/" })}
    >
      <IconLogout />
      Log out
    </button>
  );
}
