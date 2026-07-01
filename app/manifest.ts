import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clinaxy",
    short_name: "Clinaxy",
    description:
      "AI workflow platform for Australian clinics: referral triage, voice intake, ambient clinical notes, and follow-up.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F4EE",
    theme_color: "#0A6256",
    icons: [
      { src: "/clinaxy-app-icon.png", sizes: "any", type: "image/png" },
      { src: "/clinaxy-favicon.png", sizes: "any", type: "image/png" },
    ],
  };
}
