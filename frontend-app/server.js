// server.js
const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/news", async (req, res) => {
    try {
        const parser = new Parser();
        // const feed = await parser.parseURL("https://www.belta.by/rss");
        const feed = await parser.parseURL("http://fetchrss.com/rss/6812d759c7849e5a190107736812d73f612ffe15c603e932.xml");
        
        https: res.json(feed.items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
