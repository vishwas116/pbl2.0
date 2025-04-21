const fs = require('fs');
const path = require('path');

// Log current directory
console.log('Current directory:', process.cwd());

// Try to find User.js
const possiblePaths = [
    './models/User.js',
    '../models/User.js',
    path.join(__dirname, 'models', 'User.js'),
    path.join(__dirname, '..', 'models', 'User.js')
];

possiblePaths.forEach(pathToTry => {
    console.log(`Checking path: ${pathToTry}`);
    if (fs.existsSync(pathToTry)) {
        console.log(`Found User.js at: ${pathToTry}`);
    }
});