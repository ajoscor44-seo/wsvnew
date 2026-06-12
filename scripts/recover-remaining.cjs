const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const UPLOADS_DIR = './public/uploads';

async function fixRemaining() {
    console.log("🔍 Attempting to rescue remaining 34 files from alternative domain...");
    const files = fs.readdirSync(UPLOADS_DIR);
    const brokenFiles = files.filter(f => fs.statSync(path.join(UPLOADS_DIR, f)).size === 0);
    
    const patterns = [
        '2025/08', '2025/05', '2024/02', '2021/06', '2022/07', '2022/06', '2021/05', '2024/06', '2023/09'
    ];

    for (const fileName of brokenFiles) {
        let success = false;
        for (const p of patterns) {
            // Try both domains
            const domains = ['https://wsv.com.ng', 'https://whatsappstatusviews.com.ng'];
            
            for (const domain of domains) {
                const url = `${domain}/wp-content/uploads/${p}/${fileName}`;
                try {
                    console.log(`  Trying ${url}...`);
                    execSync(`curl.exe -L -s -m 10 -o "${path.join(UPLOADS_DIR, fileName)}" "${url}"`);
                    const size = fs.statSync(path.join(UPLOADS_DIR, fileName)).size;
                    if (size > 1000) { 
                        console.log(`  ✅ Recovered ${fileName} from ${domain}!`);
                        success = true;
                        break;
                    }
                } catch (e) {
                    // ignore
                }
            }
            if (success) break;
        }
    }
}

fixRemaining();
