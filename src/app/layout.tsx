import AuthInitializer from "@/components/auth/AuthInitializer";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { CompareTray } from "@/components/property/CompareTray";
import { lato, merriweather, pacifico } from "@/lib/fonts";
import { FirebaseAuthProvider } from "@/providers/FirebaseAuthProvider";
import { ReduxProvider } from "@/redux/ReduxProvider";
import "leaflet/dist/leaflet.css";
import { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import ReactQueryProvider from "./providers";


export const metadata: Metadata = {
  title: "Home Connect",
  description: "Real estate and rent management",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.variable} ${merriweather.variable} ${pacifico.variable} antialiased relative z-10`}
        suppressHydrationWarning={true}
      >
        <ReactQueryProvider>
          <ReduxProvider>
            <AuthInitializer />
            <FirebaseAuthProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </FirebaseAuthProvider>
            <CompareTray />
            <Toaster richColors position="top-right" closeButton />
          </ReduxProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}