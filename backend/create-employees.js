// ================================================
// GENERATE PASSWORD HASH
// File: generate-password.js
// Script untuk generate bcrypt hash dari password
// ================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');

// PENJELASAN:
// bcrypt.hashSync() akan generate hash dari password
// Salt rounds = 10 (standar, balance antara security dan performance)

async function generateHash() {
    const password = 'password123';
    
    console.log('\n🔐 Generating Password Hash...\n');
    console.log('Plain Password:', password);
    
    // Generate hash
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Hashed Password:', hash);
    console.log('\n✅ Copy hash di atas dan paste ke database!\n');
    
    // Test verify
    const isValid = await bcrypt.compare(password, hash);
    console.log('✅ Verification test:', isValid ? 'SUCCESS' : 'FAILED');
    console.log('\n================================================');
    console.log('UPDATE SQL:');
    console.log('================================================\n');
    console.log(`UPDATE employees SET password = '${hash}' WHERE nip = 'EMP001';`);
    console.log(`UPDATE employees SET password = '${hash}' WHERE nip = 'EMP002';`);
    console.log('\n================================================\n');
}

generateHash();