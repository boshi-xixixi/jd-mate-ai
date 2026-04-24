import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JD Mate AI - 智能面试出题器",
    template: "%s | JD Mate AI",
  },
  description: "输入岗位 JD，AI 自动生成定制化面试题库、优化简历、模拟面试。一站式求职备战工具，支持多种大模型。",
  keywords: ["JD", "面试", "简历", "AI", "大模型", "求职", "面试题", "GPT", "DeepSeek"],
  authors: [{ name: "JD Mate AI Team" }],
  creator: "JD Mate AI",
  publisher: "JD Mate AI",
  metadataBase: new URL("https://jd-mate.ai"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JD Mate AI",
    startupImage: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "JD Mate AI - 智能面试出题器",
    description: "输入岗位 JD，AI 自动生成定制化面试题库、优化简历、模拟面试",
    siteName: "JD Mate AI",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "JD Mate AI",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "JD Mate AI - 智能面试出题器",
    description: "输入岗位 JD，AI 自动生成定制化面试题库、优化简历、模拟面试",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('jd-settings');
                  if (stored) {
                    var settings = JSON.parse(stored);
                    var theme = settings.state && settings.state.theme;
                    if (theme === 'light') {
                      document.documentElement.classList.remove('dark');
                    } else if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                      }
                    }
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
