import { config } from "dotenv";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

config({ path: "../../.env" });
config({ path: "../../.env.local", override: true });

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.b-cdn.net" }, // Bunny Stream CDN
      { protocol: "https", hostname: "image.mux.com" }, // Mux thumbnails
    ],
  },
};

export default withNextIntl(nextConfig);
