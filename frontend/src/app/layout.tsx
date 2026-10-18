import { Providers } from "@/components/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PickParcelBD — Your business, delivered.",
    template: "%s | PickParcelBD",
  },
  description:
    "Shop, sell, and deliver across Bangladesh. Your marketplace and parcel delivery workspace, together.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
