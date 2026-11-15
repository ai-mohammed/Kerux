/** In-store screens: the boards must reflect the back-office catalogue (prices, availability) and never invent products. */
import { describe, expect, it } from "vitest";
import products from "../src/lib/api/fixtures/products.json";
import categories from "../src/lib/api/fixtures/categories.json";
import { toCategory, toProduct } from "@/lib/api/adapters";
import type { RawCategory, RawProduct } from "@/lib/api/raw";
import { BOARDS, buildBoard, withCategoryNames } from "@/lib/screens/boards";

const catalog = withCategoryNames(
  (products as unknown as { data: RawProduct[] }).data.map(toProduct),
  (categories as unknown as RawCategory[]).map(toCategory),
);

const names = (slug: string) => buildBoard(slug, catalog)!.items.map((i) => `${i.name} ${i.detail}`.trim());

describe("menu screens", () => {
  it("shows the products and prices of the former menu videos", () => {
    const burgers = buildBoard("burgers", catalog)!;
    expect(burgers.items.map((i) => [i.name, i.price])).toEqual([["Chicken", 600], ["Smap", 650], ["Beng", 700], ["Kerux", 750]]);
    expect(burgers.formula).toMatchObject({ price: 250 });
    expect(buildBoard("tortillas", catalog)!.items.map((i) => [i.name, i.price])).toEqual([["Wrap", 600], ["Spicy", 750], ["Boxy", 750]]);
    const tenders = buildBoard("tenders", catalog)!;
    expect(tenders.items.map((i) => i.price)).toEqual([890, 2650, 2500, 2550, 300, 450, 500, 700, 500, 450, 100, 200]);
    expect(tenders.groups?.map((g) => [g.label, g.itemIds.length])).toEqual([["Box à partager", 4], ["À la pièce", 4], ["Enfants & boissons", 4]]);
    expect(tenders.menuPrice).toBe(false);
    expect(names("tenders")[4]).toBe("3 Wings");
    expect(buildBoard("plats", catalog)!.items.map((i) => [i.name, i.price])).toEqual([["Bogota", 750], ["Poni", 850], ["Salade César", 550]]);
    const pain = buildBoard("pain-maison", catalog)!;
    expect(pain.items.map((i) => [i.name, i.price])).toEqual([["Mexicain", 500], ["Chessy", 650], ["Crunsh", 600], ["Chessy Gratiné", 700], ["Ruxy", 700]]);
    expect(pain.formula).toMatchObject({ price: 250 });
  });

  it("shows the nine pizzas of the former pizza screen, the K-Arctic first (large one), with a can in the bar", () => {
    const pizza = buildBoard("pizza", catalog)!;
    expect(pizza.layout).toBe("pizzeria");
    expect(pizza.items.map((i) => [i.name, i.price])).toEqual([
      ["K-Arctic", 1400],
      ["K-Classic", 490],
      ["K-Green", 690],
      ["Mushroom", 700],
      ["Tuna", 790],
      ["Chicken Cheese", 850],
      ["K-Chessy", 900],
      ["K-Indiana", 890],
      ["K-Pepper", 1000],
    ]);
    expect(pizza.items.every((i) => i.imageUrl?.startsWith("/ecrans/photos/pz-"))).toBe(true);
    expect(pizza.formula).toEqual({ label: "une canette", price: 100, imageUrl: "/ecrans/photos/canette-selecto.png", tall: true });
    expect(pizza.menuPrice).toBe(false);
    const noCans = catalog.map((p) => (p.id === 93 ? { ...p, available: false } : p));
    expect(buildBoard("pizza", noCans)!.formula).toBeNull();
  });

  it("follows a price change made in the back-office", () => {
    const changed = catalog.map((p) => (p.id === 150 ? { ...p, price: 690 } : p));
    expect(buildBoard("burgers", changed)!.items.find((i) => i.id === 150)?.price).toBe(690);
  });

  it("keeps an inactive product in place, marked unavailable", () => {
    const off = catalog.map((p) => (p.id === 82 ? { ...p, available: false } : p));
    const items = buildBoard("burgers", off)!.items;
    expect(items.map((i) => i.id)).toEqual([97, 150, 82, 119]);
    expect(items[2].available).toBe(false);
  });

  it("hides the add-on formula, and the menu prices with it, when it is inactive", () => {
    expect(buildBoard("burgers", catalog)!.menuPrice).toBe(true);
    const off = catalog.map((p) => (p.id === 125 ? { ...p, available: false } : p));
    const board = buildBoard("burgers", off)!;
    expect(board.formula).toBeNull();
    expect(board.menuPrice).toBe(false);
  });

  it("puts a new product of a sectioned screen in its last section", () => {
    const base = catalog.find((p) => p.id === 93)!;
    const added = [...catalog, { ...base, id: 998, name: "Jus d'orange", price: 150 }];
    expect(buildBoard("tenders", added)!.groups!.at(-1)!.itemIds).toContain(998);
  });

  it("gives each screen its own layout", () => {
    const layouts = BOARDS.map((b) => buildBoard(b.slug, catalog)!.layout);
    expect(new Set(layouts).size).toBe(BOARDS.length);
  });

  it("rejects unknown screens", () => {
    expect(buildBoard("pizzas", catalog)).toBeNull();
    expect(BOARDS.map((b) => b.slug)).toEqual(["burgers", "tortillas", "tenders", "plats", "pain-maison", "pizza"]);
  });
});
