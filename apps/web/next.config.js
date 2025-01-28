/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
    },
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
            net: false,
            tls: false,
        };

        // Disable minification to avoid the Unicode error
        config.optimization = {
            minimize: false, // Disable Webpack minification
        };

        return config;
        
    },
    swcMinify: false, // Disable SWC minification
    // Add these configurations for script loading
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://app.sandbox.midtrans.com;",
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;