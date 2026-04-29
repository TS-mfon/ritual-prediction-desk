import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Ritual Prediction Desk",
  description: "Industrial agent operations for Ritual-native work and approvals.",
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
