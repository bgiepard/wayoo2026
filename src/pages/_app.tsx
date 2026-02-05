import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { PusherProvider } from "@/context/PusherContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=pl`}
        strategy="beforeInteractive"
      />
      <NotificationsProvider>
        <PusherProvider>
          <div className={dmSans.className}>
            <Header />
            <Component {...pageProps} />
            <Footer />
          </div>
        </PusherProvider>
      </NotificationsProvider>
    </SessionProvider>
  );
}
