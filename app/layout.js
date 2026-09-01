import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "App Kehidupan",
  description: "Aplikasi pribadi untuk mengelola keuangan, kegiatan, dan catatan motivasi & sastra",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}