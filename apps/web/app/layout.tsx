import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Ritual Prediction Desk",
  description: "Autonomous prediction-market research and approvals on Ritual.",
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
