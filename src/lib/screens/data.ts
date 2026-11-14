import "server-only";
import { getCategories, getProducts } from "@/lib/api/catalog";
import { buildBoard, withCategoryNames, type ScreenBoard } from "./boards";

/** One screen's menu, straight from the back-office catalogue (cached 60 s like the rest of the menu). */
export async function getScreenBoard(slug: string): Promise<ScreenBoard | null> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return buildBoard(slug, withCategoryNames(products, categories));
}
