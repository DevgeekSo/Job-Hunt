/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Ensure undici is not bundled in the client
            config.resolve.alias['undici'] = false;
        }
        return config;
    },
};

export default nextConfig;
