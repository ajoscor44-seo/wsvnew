const fs = require('fs');

function fixJson(filePath) {
    console.log(`Fixing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The issue is that some quotes around /uploads/ are not properly escaped
    // or are double-escaped.
    
    // First, let's normalize: remove any existing escaped quotes around /uploads/ 
    // and then re-escape them correctly.
    
    // 1. Convert all \\" to " temporarily
    content = content.replace(/\\"/g, 'TEMP_QUOTE');
    
    // 2. Now any remaining " are likely the JSON structure quotes
    // But wait, the rendered content HAS " inside it.
    
    // This is hard with regex. Let's try a different approach.
    // Let's find the "rendered": "..." blocks and fix only those.
    
    content = content.replace(/"rendered":\s*"([\s\S]*?)"/g, (match, p1) => {
        // p1 is the HTML content. It should have escaped quotes.
        // Let's escape all " that are NOT preceded by \
        let fixed = p1.replace(/(?<!\\)"/g, '\\"');
        return `"rendered": "${fixed}"`;
    });

    // Also handle yoast_head which is another huge string
    content = content.replace(/"yoast_head":\s*"([\s\S]*?)"/g, (match, p1) => {
        let fixed = p1.replace(/(?<!\\)"/g, '\\"');
        return `"yoast_head": "${fixed}"`;
    });

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
}

fixJson('./src/data/posts.json');
fixJson('./src/data/pages.json');
