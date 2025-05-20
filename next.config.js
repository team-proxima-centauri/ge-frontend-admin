/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'source.unsplash.com'],
  },
  // This is needed to ensure proper handling of images from external domains
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
