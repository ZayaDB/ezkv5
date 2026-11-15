const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./i18n.ts');

function supabaseHostname() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseHostname();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // 예전 주소 호환 (페이지 파일 대신 여기서 한 번에 처리)
  async redirects() {
    const loc = ':locale(kr|en|mn)';
    const map = [
      ['home', 'my/dashboard'],
      ['dashboard', 'my/dashboard'],
      ['profile', 'my/profile'],
      ['roadmap', 'my/dashboard'],
      ['calendar', 'my/schedule'],
      ['my', 'my/dashboard'],
      ['my/roadmap', 'my/dashboard'],
      ['my/enrollments', 'my/courses?tab=status'],
    ];
    return map.map(([from, to]) => ({
      source: `/${loc}/${from}`,
      destination: `/:locale/${to}`,
      permanent: false,
    }));
  },
  experimental: {
    serverComponentsExternalPackages: ['@formatjs/intl'],
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: 'https',
            hostname: supabaseHost,
          },
        ]
      : [],
  },
};

module.exports = withNextIntl(nextConfig);
