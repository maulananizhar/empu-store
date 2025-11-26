import { prisma } from "@/lib/prisma";
import { getUserFromDb } from "@/lib/user.actions";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { AuthOptions, User } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter, // Assuming you have Prisma set up
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        if (!credentials) {
          throw new Error("No credentials provided");
        }
        const { username, password } = credentials;

        const res = await getUserFromDb(username as string, password as string);
        if (res?.status === "success") {
          const user = res.data;

          if (user) {
            const role = await prisma.roles.findUnique({
              where: {
                roleId: user.roleId,
              },
            });

            return {
              id: user.userId,
              username: user.username,
              name: user.name,
              email: user.email,
              role: role?.name,
            } as User;
          }
        }
        throw new Error(res?.message || "Invalid credentials");
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 days
  },

  jwt: {
    maxAge: 1 * 24 * 60 * 60, // 1 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as number;
      session.user.name = token.name;
      session.user.username = token.username as string;
      session.user.email = token.email;
      session.user.role = token.role as string;

      return session;
    },
  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
