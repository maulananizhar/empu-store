import { User } from "next-auth";

interface UserSession extends User {
  username?: string | null | undefined | unknown;
  roleId?: number | null | undefined | unknown;
}

export type { UserSession };
