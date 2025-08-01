import type { Metadata } from "next";
import {GeistSans} from 'geist/font/sans';
import {GeistMono} from 'geist/font/mono'
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Q&A",
  description: "An interactive Q&A system powered by Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}