"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Category, Observation, Product, Supplement } from "@/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/bits";
import { CategoryRail } from "./category-rail";
import { ProductCard } from "./product-card";
import { ProductOptionsSheet } from "./product-options-sheet";

type Props = {
  categories: Category[];
  products: Product[];
  supplements: Supplement[];
  observations: Observation[];
  initialCategory: string | null;
};

const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function MenuExplorer({ categories, products, supplements, observations, initialCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [configuring, setConfiguring] = useState<Product | null>(null);

  // Keep the pill state in sync with back/forward navigation (state adjusted during render, no effect).
  const urlCategory = params.get("c");
  const [seenUrlCategory, setSeenUrlCategory] = useState(urlCategory);
  if (urlCategory !== seenUrlCategory) {
    setSeenUrlCategory(urlCategory);
    setCategory(urlCategory);
  }

  const selectCategory = (slug: string | null) => {
    setCategory(slug);
    router.replace(slug ? `${pathname}?c=${slug}` : pathname, { scroll: false });
  };

  const optionCategoryIds = useMemo(() => new Set([...supplements, ...observations].flatMap((o) => o.categoryIds)), [supplements, observations]);

  const visible = useMemo(() => {
    const q = normalize(deferredQuery.trim());
    return products.filter((p) => {
      if (category && categories.find((c) => c.slug === category)?.id !== p.categoryId) return false;
      if (!q) return true;
      return normalize(`${p.name} ${p.description} ${p.categoryName}`).includes(q);
    });
  }, [products, categories, category, deferredQuery]);

  const groups = useMemo(() => {
    const byCat = new Map<number, Product[]>();
    for (const p of visible) byCat.set(p.categoryId, [...(byCat.get(p.categoryId) ?? []), p]);
    return categories.filter((c) => byCat.has(c.id)).map((c) => ({ category: c, products: byCat.get(c.id)! }));
  }, [visible, categories]);

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-[68px] z-30 -mx-4 bg-cream px-4 pb-3 pt-3 sm:mx-0 sm:px-0 lg:top-[76px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block md:w-80">
            <span className="sr-only">Rechercher un produit</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-500" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher : tenders, pizza, wings…"
              className="h-12 w-full rounded-full border-2 border-line-strong bg-white pl-12 pr-11 text-[15px] font-semibold placeholder:text-ink-500 focus:border-ink focus:outline-none"
              enterKeyHint="search"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-500 hover:bg-cream">
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </label>
          <CategoryRail categories={categories} active={category} onSelect={selectCategory} className="md:flex-1" />
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title="Rien ne correspond"
          text={query ? `Aucun produit pour « ${query} ». Essayez un autre mot ou parcourez les catégories.` : "Cette catégorie est vide pour le moment."}
          action={
            <Button variant="secondary" onClick={() => { setQuery(""); selectCategory(null); }}>
              Voir tout le menu
            </Button>
          }
        />
      ) : (
        groups.map(({ category: c, products: list }, gi) => (
          <section key={c.id} id={c.slug} aria-labelledby={`cat-${c.slug}`} className="scroll-mt-40 flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id={`cat-${c.slug}`} className="display text-3xl sm:text-4xl">
                {c.name}
              </h2>
              <span className="text-sm font-bold text-ink-500 num">
                {list.length} produit{list.length > 1 ? "s" : ""}
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {list.map((p, i) => (
                <li key={p.id} className={i === 0 && list.length >= 3 ? "md:col-span-full" : undefined}>
                  <ProductCard product={p} hasOptions={optionCategoryIds.has(p.categoryId)} onConfigure={setConfiguring} priority={gi === 0 && i < 4} endcap={i === 0 && list.length >= 3} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <ProductOptionsSheet product={configuring} supplements={supplements} observations={observations} onClose={() => setConfiguring(null)} />
    </div>
  );
}
