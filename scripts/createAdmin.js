// scripts/createAdmin.js
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String,
    role: String,
    isActive: Boolean
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        console.log('📍 Database:', MONGODB_URI.includes('mongodb.net') ? 'MongoDB Atlas ☁️' : 'Local MongoDB 💻');
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Show all existing users
        console.log('📋 Checking existing users...');
        const allUsers = await User.find({}).select('name email role');
        console.log(`Found ${allUsers.length} user(s):`);
        allUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
        });
        console.log('');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@pf.com' });
        
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Would you like to delete and recreate? (Run with --force flag)');
            
            // Check for --force flag
            if (process.argv.includes('--force')) {
                console.log('🗑️  Deleting existing admin...');
                await User.deleteOne({ email: 'admin@pf.com' });
                console.log('✅ Deleted\n');
            } else {
                console.log('\n💡 To recreate admin, run: node scripts/createAdmin.js --force');
                await mongoose.connection.close();
                return;
            }
        }

        // Create admin user
        console.log('👤 Creating admin user...');
        const password = 'admin123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@pf.com',
            passwordHash: hashedPassword,
            role: 'ADMIN',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    admin@pf.com');
        console.log('🔑 Password: admin123');
        console.log('👔 Role:     ADMIN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change the password after first login!\n');

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        if (error.stack) {
            console.error('\nStack trace:', error.stack);
        }
        process.exit(1);
    }
}

createAdmin();
