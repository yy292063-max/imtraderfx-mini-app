import "./globals.css";

export const metadata = {
 title: "IMTraderFX Trader Portal"
};

export default function RootLayout({children}) {
 return (
  <html>
   <body>{children}</body>
  </html>
 );
}
