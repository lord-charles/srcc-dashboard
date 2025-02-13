/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/analytics",
        permanent: false,
      },
    ];
  },
  images: {
    domains: ['i0.wp.com'], // Add the external image domain
  },
};

export default nextConfig;
