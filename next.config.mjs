/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ron-vr-webxr.html",
        permanent: false,
      },
      {
        source: "/ron-vr",
        destination: "/ron-vr-webxr.html",
        permanent: false,
      },
      {
        source: "/ron-vr-webxr",
        destination: "/ron-vr-webxr.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
