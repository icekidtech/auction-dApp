/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
      encoding: false, // new addition
      path: false,     // new addition
      url: false,      // new addition
    };
    
    // Add buffer polyfill
    config.plugins.push(
      new config.webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      })
    );
    
    return config;
  },
}

export default nextConfig
