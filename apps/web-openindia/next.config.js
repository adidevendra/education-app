/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  i18n: {
    locales: ['en', 'hi'],
    defaultLocale: 'en',
  },
  transpilePackages: ['@education/player', '@repo/sdk'],
  experimental: {
    typedRoutes: true,
  },
  webpack(config) {
    config.resolve.alias['@education/player'] = path.resolve(__dirname, '../../packages/player/index.tsx');
    config.resolve.alias['@repo/sdk'] = path.resolve(__dirname, '../../packages/sdk/src/index.ts');
    config.resolve.alias['@repo/sdk/src'] = path.resolve(__dirname, '../../packages/sdk/src');
    config.resolve.alias['@repo/sdk/src/clients/openindia'] = path.resolve(
      __dirname,
      '../../packages/sdk/src/clients/openindia.ts',
    );
    return config;
  },
};
module.exports = nextConfig;
