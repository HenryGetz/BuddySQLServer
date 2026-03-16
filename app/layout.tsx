import "./globals.css";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalCommandPalette from "@/components/layout/GlobalCommandPalette";
import { THEME_STORAGE_KEY } from "@/constants/theme";
import { defaultMetadata } from "./sitemapmetadata";

export const metadata = defaultMetadata;

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const themeSetupScript = `
  (() => {
    try {
      const themeKey = "${THEME_STORAGE_KEY}";
      const storedTheme = window.localStorage.getItem(themeKey);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch {
      // Ignore theme initialization errors and fall back to light mode.
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSetupScript }} />
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900 transition-colors">
        <Header />
        <GlobalCommandPalette />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
