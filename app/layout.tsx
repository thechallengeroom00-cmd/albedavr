import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GeeGee AI Workshop Platform",
  description: "Veilige AI-workshopomgeving voor GeeGee Gaming"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
