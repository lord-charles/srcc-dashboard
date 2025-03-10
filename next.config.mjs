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
    domains: ['i0.wp.com'], 
  },
};

export default nextConfig;
