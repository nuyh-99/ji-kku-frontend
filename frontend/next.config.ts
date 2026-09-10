import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "tong.visitkorea.or.kr",
            },
            {
                protocol: "https",
                hostname: "tong.visitkorea.or.kr",
            },
            {
                protocol: "https",
                hostname: "pub-76c3439f9097412b89e3023a31c0895d.r2.dev",
            },
        ],
    },
};

export default nextConfig;