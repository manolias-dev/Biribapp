import "./globals.css";

export const metadata = {
  title: "BiribAPP — Score Keeper",
  description: "Track scores for your Biriba games across devices.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F0F23",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
