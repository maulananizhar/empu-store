import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerSession } from "next-auth";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProviderWrapper } from "@/components/session-provider";
import { authOptions } from "@/lib/authOptions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Empu Store",
  description: "Sistem Kasir Digital SMKN 40 Jakarta - Empu Store",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id" suppressHydrationWarning>
      <link rel="icon" href="/logo-smkn-40.png" />
      <body
        className={`${geistSans.className} antialiased`}
        suppressHydrationWarning>
        <SessionProviderWrapper session={session}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
