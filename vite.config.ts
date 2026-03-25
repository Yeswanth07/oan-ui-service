import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
const virtualRouteFileChangeReloadPlugin: PluginOption = {
	name: "watch-config-restart",
	configureServer(server) {
		server.watcher.add("./src/routes.ts");
		server.watcher.on("change", (path) => {
			if (path.endsWith("src/routes.ts")) {
				console.log("Virtual route changed");
				server.restart();
			}
		});
	}
};
// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"~": path.resolve(__dirname)
		}
	},
	plugins: [
		tsconfigPaths(),
		nodePolyfills({ globals: { Buffer: true } }),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
			routesDirectory: path.resolve(__dirname, "src/pages"),
			virtualRouteConfig: "./src/routes.ts",
			generatedRouteTree: "./src/routeTree.gen.ts"
		}),
		topLevelAwait(),
		react(),
		virtualRouteFileChangeReloadPlugin
	],
	server: {
		port: 3000
	}
});
