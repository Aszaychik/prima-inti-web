// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import playformInline from "@playform/inline";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

const APP_URL = process.env.APP_URL || "http://localhost:4321";

let productUrls = [];
try {
    const res = await fetch(`${process.env.API_URL}/products`);
    const json = await res.json();
    const products = json.data ?? json;
    productUrls = products.map(
        (p) => `${APP_URL}/products/${p.id}`
    );
} catch (e) {
    console.warn('[sitemap] Could not fetch products:', e.message);
}

export default defineConfig({
    site: APP_URL,
    base: "/",
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
    vite: {
        plugins: [tailwindcss()],
        define: {
            'process.env.API_URL': JSON.stringify(process.env.API_URL),
            'process.env.APP_URL': JSON.stringify(process.env.APP_URL)
        },
    },
});