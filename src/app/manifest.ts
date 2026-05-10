import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cashly",
    short_name: "Cashly",
    description: "A personal finance management app built with Next.js and TypeScript.",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#4F46E5",
    background_color: "#FFFFFF",
    display: "standalone",
    scope: "/app/",
    start_url: "/app/",
  };
}