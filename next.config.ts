import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These packages resolve files at runtime and must not be bundled.
  serverExternalPackages: ["iyzipay", "@libsql/client", "libsql"],
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
