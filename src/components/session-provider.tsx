"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

export function SessionProviderWrapper({
  children,
  session,
  ...props
}: React.ComponentProps<typeof SessionProvider>) {
  return (
    <SessionProvider session={session} {...props}>
      {children}
    </SessionProvider>
  );
}
