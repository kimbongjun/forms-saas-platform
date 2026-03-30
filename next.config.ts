import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Turbopack은 next dev의 기본 번들러(Next.js 15+)로, HMR이 자동 활성화됩니다.
  // webpack을 직접 사용해야 할 경우 아래 블록을 활성화하세요.
  // webpack: (config) => {
  //   config.watchOptions = { poll: 1000, aggregateTimeout: 300 }
  //   return config
  // },
}

export default nextConfig
