import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: config.name,
    short_name: config.name.length > 12 ? config.name.split(" ")[0] : config.name,
    description: config.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0366d6",
    orientation: "any",
    icons: [
      {
        src: config.appIcon,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["reference", "education"],
  };
}
