import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "RitualAgentOS",
  description: "Modern agent operations for Ritual-native work, markets, and approvals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
