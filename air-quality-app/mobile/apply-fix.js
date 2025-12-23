const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'metro', 'externals.js');

try {
    console.log('Reading file:', filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    const targetLine = 'await _fs.default.promises.mkdir(shimDir, { recursive: true });';
    const patchedLine = 'if (!shimDir.includes("node:")) { await _fs.default.promises.mkdir(shimDir, { recursive: true }); }';

    if (content.includes(targetLine)) {
        console.log('Target line found. Applying patch...');
        content = content.replace(targetLine, patchedLine);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Patch applied successfully!');
    } else if (content.includes('node:')) {
        console.log('⚠️ Patch might have already been applied.');
    } else {
        console.error('❌ Target line not found!');
        // Fallback search with less specificity
        const looseTarget = 'mkdir(shimDir, {';
        if (content.includes(looseTarget)) {
            console.log('Found loose match, applying regex patch...');
            content = content.replace(
                /await _fs\.default\.promises\.mkdir\(shimDir, \{ recursive: true \}\);/g,
                patchedLine
            );
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('✅ Regex patch applied!');
        } else {
            console.log('File content preview:', content.substring(0, 500));
        }
    }
} catch (error) {
    console.error('Error applying patch:', error);
}
