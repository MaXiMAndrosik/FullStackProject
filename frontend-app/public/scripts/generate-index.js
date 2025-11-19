require("dotenv").config({
    path: require("path").join(__dirname, "../../.env.production"),
});
const fs = require("fs-extra");
const path = require("path");

const generateIndexHtml = () => {
    const publicDir = path.join(__dirname, "..");
    const indexPath = path.join(publicDir, "index.html");

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

    const siteName = getEnv("REACT_APP_SITE_NAME");
    const appName = getEnv("REACT_APP_APP_NAME");
    const siteDescription = getEnv("REACT_APP_SITE_DESCRIPTION");
    const siteDescriptionSmall = getEnv("REACT_APP_SITE_DESCRIPTION_SMALL");
    const siteKeywords = getEnv("REACT_APP_SITE_KEYWORDS");
    const siteLogo = getEnv("REACT_APP_SITE_LOGO");
    const geoRegion = getEnv("REACT_APP_GEO_REGION");
    const geoPlacename = getEnv("REACT_APP_GEO_PLACENAME");
    const geoPosition = getEnv("REACT_APP_GEO_POSITION");
    const geoIcbm = getEnv("REACT_APP_GEO_ICBM");

    const template = `<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="utf-8" />
	<link rel="apple-touch-icon" sizes="180x180" href="%PUBLIC_URL%/apple-touch-icon.png">
	<link rel="icon" href="%PUBLIC_URL%/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="%PUBLIC_URL%/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="16x16" href="%PUBLIC_URL%/favicon-16x16.png">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="theme-color" content="#000000" />

	<!-- Основные мета-теги -->
	<meta name="description" content="${siteDescription}" />
	<meta name="keywords" content="${siteKeywords}" />
	<meta name="author" content="${appName}" />

	<!-- Гео-теги -->
    <meta name="geo.region" content="${geoRegion}" />
	<meta name="geo.placename" content="${geoPlacename}" />
	<meta name="geo.position" content="${geoPosition}" />
	<meta name="ICBM" content="${geoIcbm}" />

	<!-- Open Graph для соцсетей -->
	<meta property="og:title" content="${appName}" />
	<meta property="og:description" content="${siteDescriptionSmall}" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="%PUBLIC_URL%/${siteLogo}" />
	<meta property="og:locale" content="ru_RU" />

    <!-- Twitter Card - специально для Twitter -->
	<meta name="twitter:image" content="/${siteLogo}" />
	<meta name="twitter:card" content="summary_large_image" />

	<!-- Для поисковых систем -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content="Russian" />

	<link rel="manifest" href="%PUBLIC_URL%/manifest.json" />

	<title>${siteName}</title>
</head>
<body>
	<noscript>You need to enable JavaScript to run this app.</noscript>
	<div id="root"></div>
</body>
</html>`;

    try {
        fs.writeFileSync(indexPath, template);
        console.log("✅ index.html сгенерирован из .env.production!");
    } catch (error) {
        console.error("❌ Ошибка при создании index.html:", error.message);
        process.exit(1);
    }
};

generateIndexHtml();
