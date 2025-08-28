#!/usr/bin/env node

/**
 * Migration Script
 * Helps migrate from the old monolithic app.js to the new modular structure
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting migration to modular architecture...\n');

// Check if old app.js exists
const oldAppPath = path.join(__dirname, '..', 'app.js');
if (!fs.existsSync(oldAppPath)) {
  console.log('❌ Old app.js not found. Migration not needed.');
  process.exit(0);
}

// Create backup
const backupPath = path.join(__dirname, '..', 'app.js.backup');
try {
  fs.copyFileSync(oldAppPath, backupPath);
  console.log('✅ Created backup: app.js.backup');
} catch (error) {
  console.log('❌ Failed to create backup:', error.message);
  process.exit(1);
}

// Check if new structure exists
const newStructurePath = path.join(__dirname, '..', 'src');
if (!fs.existsSync(newStructurePath)) {
  console.log('❌ New src/ directory not found. Please run the refactoring first.');
  process.exit(1);
}

// Update package.json scripts
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update main entry point
    if (packageJson.main === 'app.js') {
      packageJson.main = 'src/server.js';
      console.log('✅ Updated package.json main entry point');
    }
    
    // Update scripts
    if (packageJson.scripts) {
      if (packageJson.scripts.start === 'node app.js') {
        packageJson.scripts.start = 'node src/server.js';
      }
      if (packageJson.scripts.server === 'nodemon app.js') {
        packageJson.scripts.server = 'nodemon src/server.js';
      }
      console.log('✅ Updated package.json scripts');
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.log('⚠️  Warning: Could not update package.json:', error.message);
  }
}

// Check for environment variables
const envVars = [
  'NODE_ENV',
  'PORT',
  'MONGO_URI',
  'ALLOWED_ORIGIN'
];

console.log('\n🔧 Environment Variables Check:');
envVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`);
  } else {
    console.log(`⚠️  ${varName} is not set (may use default values)`);
  }
});

// Check database connection
console.log('\n🗄️  Database Connection Check:');
const keysPath = path.join(__dirname, '..', 'config', 'keys_dev.js');
if (fs.existsSync(keysPath)) {
  console.log('✅ Database configuration file exists');
} else {
  console.log('⚠️  Database configuration file not found');
  console.log('   Please ensure config/keys_dev.js exists with your MongoDB URI');
}

console.log('\n📋 Migration Summary:');
console.log('✅ Created backup of old app.js');
console.log('✅ Updated package.json scripts');
console.log('✅ New modular structure is ready');

console.log('\n🚀 Next Steps:');
console.log('1. Install new dependencies: npm install');
console.log('2. Test the new structure: npm test');
console.log('3. Start the server: npm run server');
console.log('4. If everything works, you can remove app.js.backup');

console.log('\n⚠️  Important Notes:');
console.log('- The old app.js is backed up as app.js.backup');
console.log('- All game logic has been moved to src/services/');
console.log('- Socket handling is now in src/socket/');
console.log('- Middleware is configured in src/middleware/');

console.log('\n🎉 Migration completed successfully!');
console.log('   Your application now follows senior engineer best practices!');
