const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'node_modules', '@expo', 'cli', 'build', 'src', 'start', 'server', 'metro', 'externals.js');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    const index = content.indexOf('mkdir');
    if (index !== -1) {
        console.log('Found mkdir at index:', index);
        console.log('Context:');
        console.log(content.substring(index - 200, index + 300));
    } else {
        console.log('mkdir not found!');
    }
} catch (error) {
    console.error('Error:', error);
}
