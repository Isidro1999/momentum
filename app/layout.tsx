import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DailyReviewProvider } from "@/providers/daily-review-provider";
import { GoalProvider } from "@/providers/goal-provider";
import { TaskProvider } from "@/providers/task-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Momentum",
  description:
    "Organización personal, seguimiento diario y reflexión para avanzar con claridad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <TaskProvider>
          <GoalProvider>
            <DailyReviewProvider>{children}</DailyReviewProvider>
          </GoalProvider>
        </TaskProvider>
      </body>
    </html>
  );
}
