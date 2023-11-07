const path = require('path');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')]
  },
  webpack: (config, context) => {
    config.module.rules.push({
      test: /\.svg$/i,
      include: path.join(__dirname, 'icons'),
      use: [
        {
          loader: 'svg-sprite-loader',
          options: {
            extract: true,
            outputPath: 'static/',
            publicPath: '_next/static/',
            esModule: false
          }
        }
      ]
    });

    config.module.rules.push({
      test: /\.svg$/i,
      include: [
        path.join(__dirname, 'public', 'logo'),
        path.join(__dirname, 'public', 'nfts')
      ],
      issuer: /\.[jt]sx?$/,

      use: [
        {
          loader: '@svgr/webpack',
          // https://react-svgr.com/docs/options/
          options: {
            dimensions: false,
            prettier: false,
            svgo: true,
            titleProp: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'removeViewBox',
                  active: false
                },
                {
                  name: 'prefixIds',
                  active: false
                }
              ]
            }
          }
        }
      ]
    });

    config.plugins.push(new SpriteLoaderPlugin());

    return config;
  }
};

module.exports = withBundleAnalyzer(nextConfig);
