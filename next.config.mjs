/** @type {import('next').NextConfig} */
const nextConfig = {
	// Для Docker-образа (см. Dockerfile). На Vercel и при npm run dev/start не включается.
	output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,
};

export default nextConfig;
