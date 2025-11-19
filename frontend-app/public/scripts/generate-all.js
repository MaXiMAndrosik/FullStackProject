
console.log("🚀 Запуск генерации всех файлов...");

try {
    // Запускаем генерацию index.html
    console.log("\n📄 Генерация index.html...");
    require("./generate-index.js");

    // Запускаем генерацию manifest.json
    console.log("\n📄 Генерация manifest.json...");
    require("./generate-manifest.js");

    // Запускаем генерацию robots.txt & sitemap.xml
    console.log("\n🔍 Генерация SEO файлов...");
    require("./generate-seo-files.js");

    console.log("\n🎉 Все файлы успешно сгенерированы!");
} catch (error) {
    console.error("❌ Ошибка при генерации файлов:", error.message);
    process.exit(1);
}
