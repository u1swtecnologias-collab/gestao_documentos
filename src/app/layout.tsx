import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Gestor de Documentos",
  description: "Plataforma centralizada para Gestão de Documentos e Processos.",
  verification: {
    google: "vHE5a4RY1pUqcipro_o4l6ByIIYBAO7U5JDdpMzueT0",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="vHE5a4RY1pUqcipro_o4l6ByIIYBAO7U5JDdpMzueT0" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
