import { viteStaticCopy } from "vite-plugin-static-copy";

export default {
	plugins: [
		viteStaticCopy({
			structured: false,
			targets: [
				{
					src: "node_modules/@mercuryworkshop/scramjet/dist/*",
					dest: "scramjet",
				},
				{
					src: "node_modules/@mercuryworkshop/scramjet-controller/dist/*",
					dest: "controller",
				},
			],
		}),
	],
	server: {
		allowedHosts: [
			"intelligent-dedication-production-f8d8.up.railway.app",
			"localhost", // keep localhost for local dev
		],
		port: 4141, // your demo port
		strictPort: true,
		host: true,
		proxy: {
			"/wisp/": {
				target: "ws://localhost:4142",
				ws: true,
				rewrite: (path) => path.replace(/^\/wisp/, ""),
			},
		},
	},
};