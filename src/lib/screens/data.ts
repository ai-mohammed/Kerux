import "server-only";
import { getLiveCatalog } from "@/lib/api/catalog";
import { buildBoard, withCategoryNames, type ScreenBoard } from "./boards";

/**
 * One screen's menu, straight from the back-office catalogue (cached like the rest of the menu).
 * Throws when the back-office is unreachable: the screen then keeps the menu it already shows.
 */
export async function getScreenBoard(slug: string): Promise<ScreenBoard | null> {
  const { products, categories } = await getLiveCatalog();
  return buildBoard(slug, withCategoryNames(products, categories));
}
