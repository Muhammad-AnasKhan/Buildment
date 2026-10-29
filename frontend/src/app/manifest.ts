import type { MetadataRoute } from "next";

// Lets learners add Edorax to their home screen and open it full screen like an app.
// Icons are the Edorax x mark on Paper (public/icons).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Edorax",
    short_name: "Edorax",
    description: "Learn by reading, playing, listening and proving it.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F7FB",
    theme_color: "#F6F7FB",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
