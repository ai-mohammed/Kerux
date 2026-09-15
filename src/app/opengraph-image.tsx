import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "Kerux Foods — Le poulet comme vous l’aimez, à Oran";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const mascot = await readFile(path.join(process.cwd(), "public/brand/mascotte.png"));
  const mascotSrc = `data:image/png;base64,${mascot.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F8F5EF", position: "relative", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 22, background: "repeating-linear-gradient(90deg, #E43B15 0 44px, #F8F5EF 44px 88px)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 22, background: "repeating-linear-gradient(90deg, #F4C616 0 44px, #050305 44px 88px)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px", width: 760 }}>
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 0.95, color: "#050305", letterSpacing: -2, textTransform: "uppercase" }}>Le poulet</div>
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 0.95, color: "#E43B15", letterSpacing: -2, textTransform: "uppercase" }}>comme vous l’aimez.</div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#5A5651" }}>Kerux Foods · Oran · Livraison, à emporter, sur place</div>
          <div style={{ marginTop: 36, display: "flex" }}>
            <div style={{ background: "#E43B15", color: "#fff", fontSize: 32, fontWeight: 800, padding: "16px 36px", borderRadius: 18 }}>Commander</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 60, top: 95, width: 440, height: 440, display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mascotSrc} width={440} height={440} alt="" />
        </div>
      </div>
    ),
    { ...size },
  );
}
