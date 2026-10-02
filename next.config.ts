import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/*": ["./data/stock-analysis.xlsx"] },
};

export default nextConfig;
