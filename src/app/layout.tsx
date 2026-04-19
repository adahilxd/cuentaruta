import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CuentaRuta — El control inteligente del conductor",
  description:
    "Registra trayectos, viáticos y documentos en segundos. Para conductores contratistas de empresas eléctricas, oil & gas, telecomunicaciones y construcción en Latinoamérica.",
  keywords: ["conductores contratistas", "viáticos", "trayectos", "liquidación", "Latinoamérica"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sora.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
