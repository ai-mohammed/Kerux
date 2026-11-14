import type { ReactNode } from "react";
import { getRestaurants } from "@/lib/api/restaurants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { StickyOrderBar } from "@/components/cart/sticky-order-bar";
import { Toaster } from "@/components/ui/toaster";

/** Header, footer, cart and toasts of the public site. The in-store screens (`/ecrans/*`) render without it. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const restaurants = await getRestaurants().catch(() => []);
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        Aller au contenu
      </a>
      <Header restaurants={restaurants} />
      <main id="contenu" className="flex-1 pb-24 lg:pb-0">
        {children}
      </main>
      <Footer restaurants={restaurants} />
      <CartDrawer />
      <StickyOrderBar />
      <Toaster />
    </>
  );
}
