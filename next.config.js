/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "instantfunding.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.instantfunding.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        pathname: "/**",
      },
    ],
    // Load images directly in the browser (no server-side optimization).
    // Fixes images not loading when deployed (e.g. Heroku).
    unoptimized: true,
  },
};

module.exports = nextConfig;
