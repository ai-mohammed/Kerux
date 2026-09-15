import type { NextConfig } from "next";

/**
 * Legacy routes of the old SPA (kept working as redirects so external links,
 * QR flyers and social bios never break). `/menu`, `/droits` and
 * `/authentication/login` keep their exact path on purpose.
 */
const legacyRedirects = [
  { source: "/authentication", destination: "/login" },
  { source: "/authentication/login", destination: "/login" },
  { source: "/authentication/singUp", destination: "/register" },
  { source: "/authentication/logout", destination: "/account" },
  { source: "/authentication/forgotPassword", destination: "/forgot-password" },
  { source: "/authentication/resetPassword/:token", destination: "/reset-password/:token" },
  { source: "/myAccount/myProfile", destination: "/account" },
  { source: "/myAccount/myOrders", destination: "/account/orders" },
  { source: "/myAccount/myOrders/:id", destination: "/order/:id" },
  { source: "/myAccount/orderMethod", destination: "/checkout" },
  { source: "/contact/complaint", destination: "/contact?type=reclamation" },
  { source: "/contact/suggestion", destination: "/contact?type=suggestion" },
  { source: "/contact/thanks", destination: "/contact" },
  { source: "/delete-account", destination: "/account/delete" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [375, 390, 430, 640, 768, 1024, 1280, 1440, 1920],
  },
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
