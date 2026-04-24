import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const port = Number(env.PORT ?? "3000");
  const rawApiUrl = (env.VITE_API_URL ?? env.VITE_API_PROXY_TARGET ?? "").replace(/\/$/, "");
  const proxyTarget = rawApiUrl.replace(/\/api$/, "") || "http://localhost:4000";

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${env.PORT}"`);
  }

  const basePath = env.BASE_PATH ?? "/";

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), runtimeErrorOverlay()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@assets": path.resolve(__dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(__dirname),
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          proxyTimeout: 30000,
          timeout: 30000,
        },
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
