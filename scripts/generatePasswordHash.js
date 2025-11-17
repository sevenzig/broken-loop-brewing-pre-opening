/**
 * Password Hash Generator
 * Run this script to generate a bcrypt hash for the admin password
 * Usage: node scripts/generatePasswordHash.js "YourPasswordHere"
 */

const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  const password = process.argv[2];
  
  if (!password) {
    console.log('Usage: node scripts/generatePasswordHash.js "YourPasswordHere"');
    console.log('Example: node scripts/generatePasswordHash.js "BrewMaster2025!"');
    process.exit(1);
  }
  
  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters long');
    process.exit(1);
  }
  
  console.log('Generating password hash...');
  console.log('Password:', password);
  
  try {
    const hash = await bcrypt.hash(password, 12);
    console.log('Generated hash:', hash);
    console.log('\nCopy this hash to lib/auth/config.ts as ADMIN_PASSWORD_HASH');
    console.log(`export const ADMIN_PASSWORD_HASH = '${hash}';`);
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generatePasswordHash();


