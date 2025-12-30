// Fix Firebase Private Key - Convert newlines to \n literals
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

console.log('🔧 Firebase Private Key Fixer\n');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('📖 Reading .env.local...');

// Find FIREBASE_PRIVATE_KEY line
const lines = envContent.split('\n');
let fixed = false;
let newLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('FIREBASE_PRIVATE_KEY=')) {
        console.log('🔍 Found FIREBASE_PRIVATE_KEY');

        // Extract the key value
        let keyValue = line.substring('FIREBASE_PRIVATE_KEY='.length);

        // Remove surrounding quotes if present
        if (keyValue.startsWith('"') && keyValue.endsWith('"')) {
            keyValue = keyValue.substring(1, keyValue.length - 1);
        }

        // Check if it has actual newlines
        if (keyValue.includes('\n')) {
            console.log('⚠️  Key has REAL newlines - fixing...');

            // Replace actual newlines with \n literals
            keyValue = keyValue.replace(/\n/g, '\\n');

            // Wrap in quotes
            newLines.push(`FIREBASE_PRIVATE_KEY="${keyValue}"`);
            fixed = true;

            console.log('✅ Fixed! Replaced real newlines with \\n literals');
        } else if (keyValue.includes('\\n')) {
            console.log('✅ Key already has correct format (\\n literals)');
            newLines.push(line);
        } else {
            console.log('⚠️  Key format unclear - keeping as is');
            newLines.push(line);
        }
    } else {
        newLines.push(line);
    }
}

if (fixed) {
    // Backup original
    fs.writeFileSync(envPath + '.backup', envContent);
    console.log('💾 Backed up original to .env.local.backup');

    // Write fixed version
    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log('✅ Wrote fixed .env.local');
    console.log('\n🎉 DONE! Restart your dev server: npm run dev\n');
} else {
    console.log('\n✅ No fix needed - key format is correct\n');
}
