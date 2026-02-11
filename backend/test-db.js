// ================================================
// TEST DATABASE CONNECTION
// File: test-db.js
// Jalankan: node test-db.js
// ================================================

// Load environment variables dari .env
require('dotenv').config();

// Import database connection
const db = require('./config/database');

console.log('🔍 Testing database connection...\n');

// Test 1: Simple query
async function testConnection() {
    try {
        // Query sederhana untuk test
        const result = await db.query('SELECT 1 + 1 AS result');
        console.log('✅ Test Query SUCCESS');
        console.log('   Result:', result[0].result); // Should be 2
        
    } catch (error) {
        console.error('❌ Test Query FAILED');
        console.error('   Error:', error.message);
    }
}

// Test 2: Check tables exist
async function checkTables() {
    try {
        const tables = await db.query('SHOW TABLES');
        console.log('\n📋 Tables in database:');
        tables.forEach(table => {
            console.log('   -', Object.values(table)[0]);
        });
        
    } catch (error) {
        console.error('❌ Check Tables FAILED');
        console.error('   Error:', error.message);
    }
}

// Test 3: Count employees
async function countEmployees() {
    try {
        const result = await db.query('SELECT COUNT(*) as total FROM employees');
        console.log('\n👥 Total Employees:', result[0].total);
        
    } catch (error) {
        console.error('❌ Count Employees FAILED');
        console.error('   Error:', error.message);
    }
}

// Run all tests
async function runTests() {
    await testConnection();
    await checkTables();
    await countEmployees();
    
    console.log('\n✅ All tests completed!');
    process.exit(0);
}

runTests();