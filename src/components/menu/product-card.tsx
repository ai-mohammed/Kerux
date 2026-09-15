"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@/types";
import { cartCount, useCartStore } from "@/lib/cart/store";
import { cn } from "@/lib/utils/cn";
import { ProductImage } from "@/components/ui/product-image";
import { PriceTag, Sticker } from "@/components/ui/bits";
import { useAddToCart } from "@/hooks/use-add-to-cart";

type Props = {
  product: Product;
  hasOptions: boolean;
  onConfigure: (product: Product) => void;
  priority?: boolean;
  /** End-cap: the first product of a category row, shown wider (the shelf's featured set). */
  endcap?: boolean;
};

/**
 * One uniform unit for every grid: photo board, name, one-line description,
 * stamped price, add button. Unavailable products keep their place with an
 * "Épuisé" tag rather than disappearing.
 */
export function ProductCard({ product, hasOptions, onConfigure, priority, endcap }: Props) {
  const addToCart = useAddToCart();
  const inCart = useCartStore((s) => cartCount(s.lines.filter((l) => l.productId === product.id)));
  const hydrated = useCartStore((s) => s.hydrated);
  const qty = hydrated ? inCart : 0;

  const onAdd = () => {
    if (!product.available) return;
    if (hasOptions) onConfigure(product);
    else addToCart(product);
  };

  return (
    <article className={cn("board group relative flex flex-col overflow-hidden transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-board-lg", endcap && "md:flex-row", !product.available && "opacity-90")}>
      <Link href={`/menu/${product.slug}`} className={cn("block", endcap && "md:w-1/2 md:shrink-0")} aria-label={`${product.name}, ${product.price} dinars`} tabIndex={-1}>
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes={endcap ? "(min-width: 1280px) 620px, (min-width: 768px) 66vw, 50vw" : "(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"}
          priority={priority}
          fit="cover"
          className={cn("aspect-[5/4] w-full", endcap && "md:aspect-auto md:h-full md:min-h-[300px]", !product.available && "grayscale-[0.6]")}
        />
      </Link>
      <div className="absolute left-3 top-3 flex flex-col gap-1.5">
        {!product.available ? <Sticker tone="yellow">Épuisé</Sticker> : null}
        {product.available && product.isNew ? <Sticker tone="red">Nouveau</Sticker> : null}
        {product.available && product.onSale ? <Sticker tone="ink">Promo</Sticker> : null}
      </div>
      <div className={cn("flex flex-1 flex-col gap-2 p-4 pt-3", endcap && "md:justify-center md:gap-3 md:p-7")}>
        <h3 className={cn("display-tight text-2xl leading-none", endcap && "md:text-5xl")}>
          <Link href={`/menu/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] hover:text-red">
            {product.name}
          </Link>
        </h3>
        {product.description ? <p className={cn("line-clamp-2 text-sm text-ink-600", endcap && "md:line-clamp-none md:max-w-prose md:text-base")}>{product.description}</p> : <p className="text-sm text-ink-500">{product.categoryName}</p>}
        <div className={cn("mt-auto flex items-end justify-between gap-3 pt-2", endcap && "md:mt-2 md:justify-start md:gap-5")}>
          <PriceTag amount={product.price} straight size={endcap ? "lg" : "md"} />
          <button
            type="button"
            onClick={onAdd}
            disabled={!product.available}
            aria-label={product.available ? (hasOptions ? `Choisir les options de ${product.name}` : `Ajouter ${product.name} au panier`) : `${product.name} est épuisé`}
            className={cn(
              "relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-red text-white transition-[transform,background-color] duration-150 hover:bg-red-600 active:scale-95 disabled:border-line disabled:bg-cream-200 disabled:text-ink-500",
              qty > 0 && "bg-ink hover:bg-ink-800",
            )}
          >
            {qty > 0 ? <span className="display-tight text-lg num">{qty}</span> : <Plus className="size-5" strokeWidth={3} aria-hidden />}
          </button>
        </div>
      </div>
    </article>
  );
}
