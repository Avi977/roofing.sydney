import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    default: "Australian Roofing Contractors — See your new Colorbond roof before you commit",
    template: "%s — Australian Roofing Contractors",
  },
  description:
    "Pick a Colorbond colour and see a realistic preview on your actual Sydney home. Free aerial visualisation, free quote, no obligation.",
  metadataBase: new URL("https://roofing.sydney"),
  openGraph: {
    title: "Australian Roofing Contractors — See your new Colorbond roof",
    description: "Pick a colour. See it on your actual roof. Book a free quote.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body className={`${inter.variable} ${fraunces.variable} antialiased`}>
        {/* Inline theme script runs before paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
