/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "instantfunding.com",
      },
    ],
    // Load images directly from Cloudinary in the browser (no server-side optimization).
    // Fixes images not loading when deployed on Heroku.
    unoptimized: true,
  },
};

module.exports = nextConfig;
