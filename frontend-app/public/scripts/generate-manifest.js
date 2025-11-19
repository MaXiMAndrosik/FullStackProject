require("dotenv").config({
    path: require("path").join(__dirname, "../../.env.production"),
});
const fs = require("fs-extra");
const path = require("path");

const generateManifestJson = () => {
    const publicDir = path.join(__dirname, "..");

    const getEnv = (key, defaultValue = "") => {
        const value = process.env[key];
        if (!value) return defaultValue;

        let cleanedValue = value;
        if (
            (cleanedValue.startsWith('"') && cleanedValue.endsWith('"')) ||
            (cleanedValue.startsWith("'") && cleanedValue.endsWith("'"))
        ) {
            cleanedValue = cleanedValue.slice(1, -1);
        }

        return cleanedValue;
    };

    const siteName = getEnv("REACT_APP_APP_NAME");
    const shortName = getEnv("REACT_APP_APP_SHORT_NAME");
    const siteDescription = getEnv("REACT_APP_SITE_DESCRIPTION_SMALL");

    console.log("🚀 Генерация manifest.json для:", siteName);

    const manifestPath = path.join(publicDir, "manifest.json");
    const manifest = {
        short_name: shortName,
        name: siteName,
        description: siteDescription,
        icons: [
            {
                src: "favicon.ico",
                sizes: "64x64 32x32 24x24 16x16",
                type: "image/x-icon",
            },
            {
                src: "/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable",
            },
            {
                src: "/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable",
            },
        ],
        start_url: ".",
        scope: "/",
        display: "standalone",
        theme_color: "#1976d2",
        background_color: "#ffffff",
        orientation: "portrait-primary",
        lang: "ru",
        categories: ["business", "productivity"],
    };

    try {
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        console.log("✅ manifest.json создан");
    } catch (error) {
        console.error("❌ Ошибка при создании manifest.json:", error.message);
        process.exit(1);
    }
};

generateManifestJson();
