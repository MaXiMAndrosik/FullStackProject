require("dotenv").config({
    path: require("path").join(__dirname, "../../.env.production"),
});
const fs = require("fs-extra");
const path = require("path");

const generateSeoFiles = () => {
    const publicDir = path.join(__dirname, "..");

    // Функция для безопасного получения переменных окружения
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

    // Получаем значения
    const siteName = getEnv("REACT_APP_SITE_NAME");
    const siteUrl = getEnv("REACT_APP_SITE_URL");
    const buildDate = new Date().toISOString().split("T")[0];

    console.log("🚀 Генерация SEO файлов для:", siteName);

    // 1. Генерация ROBOTS.TXT
    const robotsPath = path.join(publicDir, "robots.txt");
    const robotsContent = `User-agent: *
# Разрешаем важные страницы
Allow: /
Allow: /services
Allow: /about

# Запрещаем технические разделы
Disallow: /api/
Disallow: /admin/
Disallow: /owner/

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# ${siteName}
# Автоматически сгенерировано ${buildDate}`;

    // 2. Генерация SITEMAP.XML
    const sitemapPath = path.join(publicDir, "sitemap.xml");
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
    <url>
    <loc>${siteUrl}/services</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    try {
        fs.writeFileSync(robotsPath, robotsContent);
        console.log("✅ robots.txt создан");

        fs.writeFileSync(sitemapPath, sitemapContent);
        console.log("✅ sitemap.xml создан");

        console.log("🎉 Все SEO файлы успешно сгенерированы!");
    } catch (error) {
        console.error("❌ Ошибка при создании SEO файлов:", error.message);
        process.exit(1);
    }
};

generateSeoFiles();
