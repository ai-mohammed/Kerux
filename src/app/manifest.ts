import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kerux Foods",
    short_name: "Kerux",
    description: "Le poulet comme vous l’aimez, à Oran. Commandez en livraison, à emporter ou sur place.",
    start_url: "/",
    display: "standalone",
    lang: "fr",
    background_color: "#F8F5EF",
    theme_color: "#E43B15",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
