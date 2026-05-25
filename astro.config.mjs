// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import playformInline from "@playform/inline";
import netlify from "@astrojs/netlify";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

const APP_URL = process.env.APP_URL || "http://localhost:4321";
const API_URL = process.env.API_URL || "http://localhost:8080/api/v1";
const ALLOWED_HOST = process.env.ALLOWED_HOST || "localhost";

let productUrls = [];
try {
    const res = await fetch(`${API_URL}/products`);
    const json = await res.json();
    const products = json.data ?? json;
    productUrls = products.map(
        (p) => `${API_URL}/products/${p.id}`
    );
} catch (e) {
    console.warn('[sitemap] Could not fetch products:', e.message);
}

export default defineConfig({
    site: APP_URL,
    base: "/",
    server: {
        allowedHosts: [ALLOWED_HOST, "www." + ALLOWED_HOST],
    },
    integrations: [
        mdx(),
        playformInline({ Critters: true }),
        sitemap({
            customPages: productUrls,
        }),
    ],
    output: "static",
    devToolbar: {
        enabled: false,
    },
    adapter: netlify(),
    vite: {
        plugins: [tailwindcss()],
        define: {
            'process.env.API_URL': JSON.stringify(API_URL),
            'process.env.APP_URL': JSON.stringify(APP_URL)
        },
    },
});
