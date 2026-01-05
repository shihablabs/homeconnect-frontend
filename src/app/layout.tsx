import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { CompareTray } from "@/components/property/CompareTray";
import { lato, merriweather, pacifico } from "@/lib/fonts";
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
            <LayoutWrapper>{children}</LayoutWrapper>
            <CompareTray />
            <Toaster richColors position="top-right" closeButton />
            {}
            {/* <Script id="tawk-to" strategy="lazyOnload">
              {`
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/69503d6f5585f019809e835b/1jdgmvvio';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
                })();
              `}
            </Script> */}
          </ReduxProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}