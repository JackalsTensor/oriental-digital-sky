import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** 静态导出(Cloudflare Pages 部署):build 输出 out/ */
  output: "export",
};

export default nextConfig;
