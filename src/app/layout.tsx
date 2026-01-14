import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
// import Header from "@/components/header";

export const metadata: Metadata = {
  title: "3D PrintManager",
  description: "Sistema de Gerenciamento de Impressoras 3D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="h-full w-full">
      <body className="flex flex-col h-full w-full min-h-screen min-w-0 scrollbar-dark">
        <AuthProvider>
          {/* <Header /> */}
          <main className="flex-1 h-full w-full min-h-0 min-w-0 overflow-auto bg-gray-900">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
