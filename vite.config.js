import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target:
          "https://brokersystemapi-gwcjhnbzaggfbygq.italynorth-01.azurewebsites.net",
        changeOrigin: true,
      },
    },
  },
});
