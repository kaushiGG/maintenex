/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Add your lovable-tagger integration if needed
    if (process.env.NODE_ENV === 'development') {
      // You may need to adjust this based on lovable-tagger's Next.js integration
    }
    return config;
  },
}

module.exports = nextConfig 