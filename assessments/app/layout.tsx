import "./globals.css";
import { Space_Grotesk, Source_Sans_3 } from "next/font/google";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata = {
  title: "Risk Assessment Onboarding",
  description: "Cyber risk assessment onboarding questionnaire"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <div className="min-h-screen bg-gradient-to-b from-white via-white to-mist/70">
          {children}
        </div>
      </body>
    </html>
  );
}
