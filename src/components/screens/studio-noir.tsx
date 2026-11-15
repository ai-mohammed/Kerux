"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ScreenBoard, ScreenItem } from "@/lib/screens/boards";
import { cn } from "@/lib/utils/cn";
import s from "./studio-noir.module.css";

const REFRESH_MS = 10_000;
const HERO_MS = 7_000;
/** "1 000" like "2 650" (Intl in fr skips the space under 10 000 in some browsers), no-break space (the display font has no narrow one). */
const dinars = { format: (v: number) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0") };

/* ------------------------------------------------------------------ hooks */

/** Latest menu from the back-office, refreshed every 10 s and when the screen becomes visible; on a network error the last menu stays on screen. */
function useLiveBoard(slug: string, initial: ScreenBoard | null) {
  const [board, setBoard] = useState(initial);
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const res = await fetch(`/api/screens/${slug}`, { cache: "no-store" });
        if (res.ok && alive) setBoard((await res.json()) as ScreenBoard);
      } catch {
        /* offline: keep showing the last menu */
      }
    };
    // Poll, and also refresh as soon as the screen becomes visible again (a hidden tab polls slowly or not at all).
    const onVisible = () => document.visibilityState === "visible" && refresh();
    const id = setInterval(refresh, REFRESH_MS);
    // Right away too: after a restart without network the page comes from the TV's copy, and the last menu kept there may be newer.
    void refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [slug]);
  return board;
}

/** Keeps the screen page, its photos and the last menu on the TV (see public/ecrans-sw.js), so it restarts even without network. */
function useOfflineCopy() {
  useEffect(() => {
    navigator.serviceWorker?.register("/ecrans-sw.js", { scope: "/ecrans/" }).catch(() => {});
  }, []);
}

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

function useTick(ms: number, enabled: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms, enabled]);
  return tick;
}

/** Keeps the TV awake when the browser allows it (re-requested when the tab becomes visible again). */
function useWakeLock() {
  useEffect(() => {
    type Sentinel = { release: () => Promise<void> };
    let lock: Sentinel | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<Sentinel> } };
    const request = () => nav.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    const onVisible = () => document.visibilityState === "visible" && request();
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, []);
}

/* ------------------------------------------------------------- primitives */

type Ctx = { board: ScreenBoard; menu: (item: ScreenItem) => number | null };

function Price({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn(s.price, className)}>
      {dinars.format(value)}
      <small>DA</small>
    </span>
  );
}

/** Price block: the product price, and under it the menu price (product + frites/canette) when the screen sells menus. */
function PriceBlock({ item, ctx, className, inline }: { item: ScreenItem; ctx: Ctx; className?: string; inline?: boolean }) {
  if (!item.available) return <span className={cn(s.soldOut, className)}>Épuisé</span>;
  const menu = ctx.menu(item);
  return (
    <span className={cn(s.priceBlock, inline && s.priceInline, className)}>
      <Price value={item.price} />
      {menu !== null ? (
        <span className={s.menuPill}>
          Menu <b>{dinars.format(menu)}</b> DA
        </span>
      ) : null}
    </span>
  );
}

/** Studio photo filling its box (cover); boxes are sized to the source crops so the product stays whole and sharp. */
function Photo({ src, sizes, className, zoom, breathe }: { src: string | null; sizes: string; className?: string; zoom?: boolean; breathe?: number }) {
  return (
    <span className={cn(s.photo, className)}>
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          quality={90}
          className={cn(s.photoFg, zoom && s.zoom, breathe !== undefined && s.breathe)}
          style={breathe !== undefined ? { animationDelay: `${-breathe * 5}s` } : undefined}
          loading="eager"
        />
      ) : null}
    </span>
  );
}

/* ---------------------------------------------------------------- chassis */

/**
 * Studio noir screens. Every TV shares the same frame (Kerux header with an orange
 * rule, yellow menu bar at the bottom); only the centre changes: `vitrine`
 * (rotating named photo + list), `trio` (columns), `grille` (sections of tiles),
 * `mosaique` (one large dish, others stacked), `etagere` (photo rows).
 */
export function StudioNoirScreen({ slug, initial }: { slug: string; initial: ScreenBoard | null }) {
  const board = useLiveBoard(slug, initial);
  useWakeLock();
  useOfflineCopy();
  // Back-office unreachable when the page was built and nothing kept yet: mascot on black until the first menu arrives.
  if (!board) return <Waiting />;
  return <Board board={board} />;
}

function Waiting() {
  return (
    <div className={s.stage}>
      <div className={cn(s.tv, s.waiting)}>
        <Image src="/brand/mascotte.png" alt="Kerux" width={200} height={205} priority />
      </div>
    </div>
  );
}

function Board({ board }: { board: ScreenBoard }) {
  const reduced = useReducedMotion();
  const ctx: Ctx = useMemo(
    () => ({ board, menu: (item) => (board.menuPrice && board.formula ? item.price + board.formula.price : null) }),
    [board],
  );

  return (
    <div className={s.stage}>
      <div className={s.tv}>
        <header className={s.head}>
          <Image src="/brand/mascotte.png" alt="" width={200} height={205} className={s.coq} priority />
          <div className={s.headTitle}>
            <h1>{board.title}</h1>
            <p>{board.subtitle}</p>
          </div>
          <div className={s.brand}>
            <span className={s.wordmark}>Kerux</span>
            <span className={s.slogan}>Saveur · Vitalité</span>
          </div>
        </header>

        <main className={s.main}>
          {board.layout === "trio" ? (
            <Trio ctx={ctx} />
          ) : board.layout === "grille" ? (
            <Grille ctx={ctx} />
          ) : board.layout === "mosaique" ? (
            <Mosaique ctx={ctx} />
          ) : board.layout === "etagere" ? (
            <Etagere ctx={ctx} />
          ) : (
            <Vitrine ctx={ctx} reduced={reduced} />
          )}
        </main>

        <footer className={s.foot}>
          {board.formula ? (
            <>
              {board.formula.imageUrl ? (
                <span className={s.footImg}>
                  <Image src={board.formula.imageUrl} alt="" fill sizes="8vw" quality={90} className={s.footImgFg} />
                </span>
              ) : null}
              <span className={s.footText}>
                <b>{board.menuPrice ? "Faites-en un menu" : "Ajoutez"}</b> {board.formula.label}
              </span>
              <span className={s.footPrice}>
                +{dinars.format(board.formula.price)}
                <small>DA</small>
              </span>
            </>
          ) : null}
          <span className={s.socials}>kerux-foods.com · @keruxfoods</span>
        </footer>

      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- layouts */

/** Rotating photo on the left, list with thumbnails on the right; the row on screen is lit. */
function Vitrine({ ctx, reduced }: { ctx: Ctx; reduced: boolean }) {
  const { board } = ctx;
  const tick = useTick(HERO_MS, !reduced);
  const pool = board.items.filter((i) => i.available && i.imageUrl);
  const hero = pool.length ? pool[tick % pool.length] : undefined;
  return (
    <div className={s.vitrine}>
      <div className={s.hero}>
        {pool.map((item) => (
          <Photo key={item.id} src={item.imageUrl} sizes="42vw" className={cn(s.heroPhoto, item.id === hero?.id && s.heroOn)} zoom={!reduced && item.id === hero?.id} />
        ))}
        {hero ? (
          <div key={hero.id} className={s.heroCap}>
            <h2>{hero.name}</h2>
            <PriceBlock item={hero} ctx={ctx} className={s.heroPrice} />
          </div>
        ) : null}
      </div>
      <ul className={s.list}>
        {board.items.map((item) => (
          <li key={item.id} className={cn(s.row, !item.available && s.off, item.id === hero?.id && s.lit)}>
            <Photo src={item.imageUrl} sizes="8vw" className={s.rowThumb} />
            <div className={s.text}>
              <h3>{item.name}</h3>
              {item.detail ? <p className={cn(s.desc, s.clamp2)}>{item.detail}</p> : null}
            </div>
            <PriceBlock item={item} ctx={ctx} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Few products: one tall column each, photo on top, text on a solid band. */
function Trio({ ctx }: { ctx: Ctx }) {
  const { board } = ctx;
  return (
    <ul className={s.cols} style={{ gridTemplateColumns: `repeat(${Math.max(1, board.items.length)}, 1fr)` }}>
      {board.items.map((item, i) => (
        <li key={item.id} className={cn(s.card, s.col, !item.available && s.off)}>
          <Photo src={item.imageUrl} sizes="32vw" className={s.cardPhoto} breathe={item.available ? i : undefined} />
          <div className={s.band}>
            <h3>{item.name}</h3>
            {item.detail ? <p className={cn(s.desc, s.clamp2)}>{item.detail}</p> : null}
            <PriceBlock item={item} ctx={ctx} inline />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Tile({ item, ctx, size, breathe }: { item: ScreenItem; ctx: Ctx; size: "xl" | "lg" | "md" | "sm"; breathe?: number }) {
  return (
    <li className={cn(s.card, s.tile, s[size], !item.available && s.off)}>
      <Photo src={item.imageUrl} sizes={size === "xl" ? "50vw" : size === "lg" ? "24vw" : "12vw"} className={s.cardPhoto} breathe={item.available ? breathe : undefined} />
      {item.badge ? <span className={s.badge}>{item.badge}</span> : null}
      <div className={s.tileBand}>
        <div className={s.text}>
          <h3>{item.name}</h3>
          {item.detail ? <p className={cn(s.desc, s.clamp2)}>{item.detail}</p> : null}
        </div>
        <PriceBlock item={item} ctx={ctx} />
      </div>
    </li>
  );
}

/** Long menus (Tenders & Box): titled sections, the shareable boxes large on top. */
function Grille({ ctx }: { ctx: Ctx }) {
  const { board } = ctx;
  const byId = new Map(board.items.map((i) => [i.id, i]));
  const groups = board.groups ?? [{ label: "", size: "md" as const, itemIds: board.items.map((i) => i.id) }];
  const [first, ...rest] = groups;
  const section = (g: (typeof groups)[number]) => {
    const items = g.itemIds.map((id) => byId.get(id)).filter((i): i is ScreenItem => !!i);
    return (
      <section key={g.label} className={s.section}>
        {g.label ? <h2 className={s.sectionLabel}>{g.label}</h2> : null}
        <ul className={s.tiles} style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, 1fr)` }}>
          {items.map((item, i) => (
            <Tile key={item.id} item={item} ctx={ctx} size={g.size} breathe={g.size === "lg" ? i : undefined} />
          ))}
        </ul>
      </section>
    );
  };
  return (
    <div className={s.grille}>
      {first ? <div className={s.grilleTop}>{section(first)}</div> : null}
      {rest.length ? <div className={s.grilleBottom}>{rest.map(section)}</div> : null}
    </div>
  );
}

/** Few dishes: the first one large on the left, the others stacked on the right. */
function Mosaique({ ctx }: { ctx: Ctx }) {
  const { board } = ctx;
  const big = board.items[0];
  const others = board.items.filter((i) => i !== big);
  return (
    <ul className={s.mosaique} style={{ gridTemplateRows: `repeat(${Math.max(1, others.length)}, 1fr)` }}>
      {big ? <Tile item={big} ctx={ctx} size="xl" breathe={0} /> : null}
      {others.map((item, i) => (
        <Tile key={item.id} item={item} ctx={ctx} size="lg" breathe={i + 1} />
      ))}
    </ul>
  );
}

/** One wide photo row per product, price and menu price side by side. */
function Etagere({ ctx }: { ctx: Ctx }) {
  const { board } = ctx;
  return (
    <ul className={s.shelf}>
      {board.items.map((item) => (
        <li key={item.id} className={cn(s.card, s.shelfRow, !item.available && s.off)}>
          <Photo src={item.imageUrl} sizes="16vw" className={s.shelfPhoto} />
          <div className={s.text}>
            <h3>{item.name}</h3>
            {item.detail ? <p className={cn(s.desc, s.clamp1)}>{item.detail}</p> : null}
          </div>
          <PriceBlock item={item} ctx={ctx} inline />
        </li>
      ))}
    </ul>
  );
}
