import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "代练妈妈 - 专业游戏代练平台",
  description: "安全可靠的游戏代练接单平台，提供王者荣耀、和平精英、原神等热门游戏代练服务",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
