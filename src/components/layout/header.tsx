import Link from "next/link";
import type { Restaurant } from "@/types";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/bits";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { RestaurantSwitcher } from "./restaurant-switcher";
import { CartButton } from "./cart-button";
import { AccountButton } from "./account-button";
import { MobileMenu } from "./mobile-menu";

/**
 * Sticky shop front on every viewport: mascot + wordmark, the restaurant you
 * order from with its live OUVERT / FERMÉ neon, the basket, and Commander.
 * On phones the switcher goes compact and the wordmark drops, nothing else.
 */
export function Header({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream">
      <Container className="flex h-[68px] items-center gap-2 sm:gap-3 lg:h-[76px]">
        <Logo className="[&>span]:hidden sm:[&>span]:inline" />
        <nav aria-label="Navigation principale" className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-[15px] font-bold text-ink hover:bg-cream-200 hover:text-red">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-1 min-w-0 flex-1 sm:ml-2 lg:hidden">
          <RestaurantSwitcher restaurants={restaurants} compact />
        </div>
        <div className="ml-auto hidden lg:block">
          <RestaurantSwitcher restaurants={restaurants} />
        </div>
        <div className="flex items-center gap-2 lg:ml-3">
          <div className="hidden sm:block">
            <AccountButton />
          </div>
          <CartButton />
          <div className="hidden lg:block">
            <Button href="/menu">Commander</Button>
          </div>
          <MobileMenu restaurants={restaurants} />
        </div>
      </Container>
    </header>
  );
}
