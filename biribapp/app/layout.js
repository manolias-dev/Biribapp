import "./globals.css";

export const metadata = {
  title: "BiribAPP",
  description: "Score keeper for the Greek card game Biriba",
  themeColor: "#0A2818",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
