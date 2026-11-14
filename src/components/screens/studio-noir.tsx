"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ScreenBoard, ScreenItem } from "@/lib/screens/boards";
import { cn } from "@/lib/utils/cn";
import s from "./studio-noir.module.css";

const REFRESH_MS = 20_000;
const HIGHLIGHT_MS = 7_000;
const dinars = new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 });

function Price({ value, plus, className }: { value: number; plus?: boolean; className?: string }) {
  return (
    <span className={cn(s.price, className)}>
      {plus ? "+" : ""}
      {dinars.format(value)}
      <small>DA</small>
    </span>
  );
}

function SoldOut({ className }: { className?: string }) {
  return <span className={cn(s.soldOut, className)}>Épuisé</span>;
}

/** Latest menu from the back-office, refreshed every 20 s; on a network error the last menu stays on screen. */
function useLiveBoard(initial: ScreenBoard) {
  const [board, setBoard] = useState(initial);
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      try {
        const res = await fetch(`/api/screens/${initial.slug}`, { cache: "no-store" });
        if (res.ok && alive) setBoard((await res.json()) as ScreenBoard);
      } catch {
        /* offline: keep showing the last menu */
      }
    };
    const id = setInterval(refresh, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [initial.slug]);
  return board;
}

/** Counter that moves the highlighted product every few seconds (frozen when reduced motion is requested). */
function useTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((t) => t + 1), HIGHLIGHT_MS);
    return () => clearInterval(id);
  }, []);
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

function Photo({ src, sizes, className }: { src: string | null; sizes: string; className?: string }) {
  return <span className={cn(s.photo, className)}>{src ? <Image src={src} alt="" fill sizes={sizes} loading="eager" /> : null}</span>;
}

function Formula({ formula }: { formula: NonNullable<ScreenBoard["formula"]> }) {
  return (
    <div className={s.formula}>
      <Photo src={formula.imageUrl} sizes="5vw" className={s.formulaImg} />
      <span className={s.formulaText}>Faites-en un menu : {formula.label.toLowerCase()}</span>
      <Price value={formula.price} plus />
    </div>
  );
}

/**
 * "Studio noir" menu screens. One family (black, Anton, yellow accents) with a
 * different layout per TV: `vitrine` (featured product + list), `trio` (big
 * columns), `grille` (photo tiles for long menus).
 */
export function StudioNoirScreen({ initial }: { initial: ScreenBoard }) {
  const board = useLiveBoard(initial);
  const tick = useTick();
  useWakeLock();
  const featured = useMemo(() => board.items.filter((i) => i.available && i.imageUrl), [board.items]);
  const highlight: ScreenItem | undefined = featured.length ? featured[tick % featured.length] : undefined;

  return (
    <div className={s.stage}>
      {board.layout === "trio" ? (
        <Trio board={board} highlightId={highlight?.id} />
      ) : board.layout === "grille" ? (
        <Grille board={board} highlightId={highlight?.id} />
      ) : (
        <Vitrine board={board} featured={featured} hero={highlight ?? board.items[0]} />
      )}
    </div>
  );
}

type BoardProps = { board: ScreenBoard; highlightId?: number };

/** Featured product large on the left, rotating, and the full list on the right. */
function Vitrine({ board, featured, hero }: { board: ScreenBoard; featured: ScreenItem[]; hero?: ScreenItem }) {
  return (
    <div className={cn(s.tv, s.vitrine)}>
      <div className={s.hero}>
        {featured.map((item) => (
          <Image key={item.id} src={item.imageUrl!} alt="" fill sizes="45vw" loading="eager" className={cn(s.heroImg, item.id === hero?.id && s.heroOn)} />
        ))}
        <Image src="/brand/mascotte.png" alt="Kerux" width={160} height={164} className={s.logo} priority />
        {hero ? (
          <div className={s.cap}>
            <div className={s.une}>À la une</div>
            <h2 className={s.heroName}>{hero.name}</h2>
            {hero.available ? <Price value={hero.price} /> : null}
          </div>
        ) : null}
      </div>
      <div className={s.side}>
        <div className={s.cat}>Kerux · {board.subtitle}</div>
        <h1 className={s.title}>{board.title}</h1>
        <ul className={s.list}>
          {board.items.map((item) => (
            <li key={item.id} className={cn(s.row, !item.available && s.off, item.id === hero?.id && s.on)}>
              <div className={s.text}>
                <h3>{item.name}</h3>
                {item.detail ? <p>{item.detail}</p> : null}
              </div>
              {item.available ? <Price value={item.price} /> : <SoldOut />}
            </li>
          ))}
        </ul>
        {board.formula ? <Formula formula={board.formula} /> : null}
      </div>
    </div>
  );
}

/** Few products, each in a tall column: photo on top, name and price very large. */
function Trio({ board, highlightId }: BoardProps) {
  return (
    <div className={cn(s.tv, s.trio)}>
      <header className={s.trioHead}>
        <Image src="/brand/mascotte.png" alt="Kerux" width={160} height={164} className={s.trioLogo} priority />
        <div>
          <div className={s.cat}>Kerux · {board.subtitle}</div>
          <h1 className={s.title}>{board.title}</h1>
        </div>
        {board.formula ? <Formula formula={board.formula} /> : null}
      </header>
      <ul className={s.cols} style={{ gridTemplateColumns: `repeat(${Math.max(1, board.items.length)}, 1fr)` }}>
        {board.items.map((item) => (
          <li key={item.id} className={cn(s.col, !item.available && s.off, item.id === highlightId && s.on)}>
            <Photo src={item.imageUrl} sizes="34vw" className={s.colPhoto} />
            <div className={s.colText}>
              <h3>{item.name}</h3>
              {item.detail ? <p>{item.detail}</p> : null}
              {item.available ? <Price value={item.price} /> : <SoldOut />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Long menus (Tenders & Box): photo tiles, name and price printed large on each photo. */
function Grille({ board, highlightId }: BoardProps) {
  const cols = board.items.length > 8 ? Math.ceil(board.items.length / 2) : Math.max(1, Math.min(4, board.items.length));
  return (
    <div className={cn(s.tv, s.grille)}>
      <header className={s.grilleHead}>
        <Image src="/brand/mascotte.png" alt="Kerux" width={160} height={164} className={s.grilleLogo} priority />
        <h1 className={s.title}>{board.title}</h1>
        <div className={s.cat}>{board.subtitle}</div>
      </header>
      <ul className={s.tiles} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {board.items.map((item) => (
          <li key={item.id} className={cn(s.tile, !item.available && s.off, item.id === highlightId && s.on)}>
            <Photo src={item.imageUrl} sizes="17vw" className={s.tilePhoto} />
            <div className={s.tileText}>
              <h3>{item.name}</h3>
              {item.detail ? <p>{item.detail}</p> : null}
            </div>
            {item.available ? <Price value={item.price} className={s.tilePrice} /> : <SoldOut className={s.tilePrice} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
