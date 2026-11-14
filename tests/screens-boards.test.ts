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
    expect(tenders.items.map((i) => i.price)).toEqual([300, 450, 500, 700, 890, 2650, 2500, 2550, 500, 450, 100, 200]);
    expect(tenders.formula).toBeNull();
    expect(names("tenders")[0]).toBe("Wings 3 pièces");
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

  it("hides the add-on formula when it is inactive", () => {
    const off = catalog.map((p) => (p.id === 125 ? { ...p, available: false } : p));
    expect(buildBoard("burgers", off)!.formula).toBeNull();
  });

  it("adds a new back-office product to its screen automatically", () => {
    const base = catalog.find((p) => p.id === 97)!;
    const added = [...catalog, { ...base, id: 999, name: "Double K", price: 900 }];
    expect(buildBoard("burgers", added)!.items.at(-1)).toMatchObject({ name: "Double K", price: 900 });
  });

  it("gives each screen its own layout", () => {
    const layouts = BOARDS.map((b) => buildBoard(b.slug, catalog)!.layout);
    expect(new Set(layouts).size).toBe(BOARDS.length);
  });

  it("rejects unknown screens", () => {
    expect(buildBoard("pizzas", catalog)).toBeNull();
    expect(BOARDS.map((b) => b.slug)).toEqual(["burgers", "tortillas", "tenders"]);
  });
});
