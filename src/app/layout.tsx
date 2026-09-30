import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/vietnamese-700.css";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/be-vietnam-pro/latin-700.css";
import "./globals.css";
import "./site-pages.css";
import "./product-experience.css";
import "./commerce.css";
import "./brand.css";
import { AccountSession } from "./account-session";
import { Navigation } from "./interactive";
import { SiteFooter } from "./site-chrome";
export const metadata: Metadata = {
  title: "Heros — Vì bạn xứng đáng được quan tâm",
  description:
    "Khám phá câu chuyện Heros, thiết bị SOS nhỏ gọn kết nối những người bạn thương. Khám phá sản phẩm và kết nối cùng Heros.",
  icons: { icon: "/images/heros-logo.png" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <AccountSession>
          <a href="#main" className="skip-link">
            Đến nội dung chính
          </a>
          <Navigation />
          {children}
          <SiteFooter />
        </AccountSession>
      </body>
    </html>
  );
}
