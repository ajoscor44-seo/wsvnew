const fs = require('fs');
const https = require('https');

const API_URL = "https://wsv.com.ng/wp-json/wp/v2";

async function fetchData(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`${API_URL}/${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', (err) => reject(err));
  });
}

async function migrate() {
  console.log("🚀 Starting WordPress Content Migration...");

  try {
    // Fetch Posts
    console.log("Fetching Posts...");
    const posts = await fetchData("posts?per_page=100&_embed");
    fs.writeFileSync('./src/data/posts.json', JSON.stringify(posts, null, 2));
    console.log(`✅ ${posts.length} Posts Saved.`);

    // Fetch Pages
    console.log("Fetching Pages...");
    const pages = await fetchData("pages?per_page=100&_embed");
    fs.writeFileSync('./src/data/pages.json', JSON.stringify(pages, null, 2));
    console.log(`✅ ${pages.length} Pages Saved.`);

    console.log("🎉 Migration Complete! All content is now local.");
  } catch (error) {
    console.error("❌ Migration Failed:", error.message);
  }
}

migrate();
