import fs from 'fs';
import path from 'path';

const excludes = ['node_modules', '.next', '.git', 'package-lock.json', 'scripts'];
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.html', '.json'];

function stripComments(content, extension) {
    if (extension === '.json') {
        // Basic JSON comment stripping (for tsconfig.json etc)
        return content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    }

    if (extension === '.html') {
        return content.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Regex for JS/TS/CSS
    // This regex matches strings (to skip them) AND comments
    // Group 1: Strings (either double, single, or backticks)
    // Group 2: Single line comments
    // Group 3: Multi-line comments
    const regex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|(?:\/\/[^\r\n]*)|\/\*[\s\S]*?\*\/)/g;

    return content.replace(regex, (match) => {
        if (match.startsWith('//') || match.startsWith('/*')) {
            return ''; // Strip comment
        }
        return match; // Keep string
    }).replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up excessive empty lines
}

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (!fileExtensions.includes(ext)) return;

    console.log(`Processing: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const stripped = stripComments(content, ext);

    if (content !== stripped) {
        fs.writeFileSync(filePath, stripped, 'utf8');
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!excludes.includes(file)) {
                walkDir(fullPath);
            }
        } else {
            processFile(fullPath);
        }
    }
}

// Start processing
const targetDir = process.argv[2] || process.cwd();
console.log(`Starting comment removal in: ${targetDir}`);
walkDir(targetDir);
console.log('Finished removing comments!');
