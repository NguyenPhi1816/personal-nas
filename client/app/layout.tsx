import type { Metadata } from "next";
import "../src/styles/globals.css";
import { env } from "@/src/lib/env";
import { Be_Vietnam_Pro, Inter, Geist } from "next/font/google";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/src/providers/auth-context";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-headline",
  display: "swap",
});

export const metadata: Metadata = {
  title: env.appName,
  description: `${env.appName} File Manager`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn("dark", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => {
            try {
              const key = 'personal-nas-theme';
              const stored = window.localStorage.getItem(key);
              const theme = stored === 'light' || stored === 'dark'
                ? stored
                : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              const root = document.documentElement;
              root.classList.remove('light', 'dark');
              root.classList.add(theme);
              root.style.colorScheme = theme;
            } catch (error) {}
          })();`}
        </Script>
      </head>
      <body className={`${inter.variable} ${beVietnamPro.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
