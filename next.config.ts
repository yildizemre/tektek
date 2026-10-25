import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages resolve files at runtime and must not be bundled.
  serverExternalPackages: ["@libsql/client", "libsql"],
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Görseller id başına değişmez; optimize edilmiş kopyalar uzun süre önbellekte kalsın.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
