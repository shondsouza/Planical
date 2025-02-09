import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/embed.ts"),
      name: "DangerousHTML",
      fileName: "default/lib",
      formats: ["umd", "es", "cjs"],
    },
  },
});
