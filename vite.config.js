import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/picked_orders_staged_for_packing": "http://localhost:3000",
      "/inventory/transfer": "http://localhost:3000",
      "/items": "http://localhost:3000",
    },
  },
});
