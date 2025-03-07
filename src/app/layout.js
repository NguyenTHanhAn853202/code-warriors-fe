import "./globals.css";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={"h-[100vh]"}
      >
        {children}
      </body>
    </html>
  );
}
