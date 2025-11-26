import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth" {
  interface User {
    id: number;
    username: string;
    role: string;
  }
}
