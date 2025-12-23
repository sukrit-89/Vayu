const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'metro', 'externals.js');

try {
    console.log('Reading file:', filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    // The pattern found in debug-output: await (0, _dir).mkdir(shimDir, { recursive: true });
    // We use a flexible regex to catch it
    const regex = /await\s*\(\w+,\s*_\w+\)\.mkdir\(shimDir,\s*\{\s*recursive:\s*true\s*\}\);/g;

    if (regex.test(content)) {
        console.log('Target pattern found! Applying patch...');

        content = content.replace(regex, (match) => {
            return `if (shimDir.indexOf("node:") === -1) { ${match} }`;
        });

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Patch applied successfully!');
    } else {
        // Check if valid patch already applied
        if (content.includes('shimDir.indexOf("node:")')) {
            console.log('⚠️ Patch already applied.');
        } else {
            console.error('❌ Target pattern NOT found. Manual intervention required.');
            // aggressive verify
            const index = content.indexOf('mkdir(shimDir');
            if (index !== -1) {
                console.log('Pending manual fix around index:', index);
                console.log(content.substring(index - 50, index + 50));
            }
        }
    }
} catch (error) {
    console.error('Error applying patch:', error);
}
