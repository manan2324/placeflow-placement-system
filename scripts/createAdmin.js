// scripts/createAdmin.js
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-monitoring-system';

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
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@pms.com' });
        
        if (existingAdmin) {
            console.log('❌ Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            await mongoose.connection.close();
            return;
        }

        // Create admin user
        const password = 'admin123'; // Default password
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@pms.com',
            passwordHash: hashedPassword,
            role: 'ADMIN',
            isActive: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    admin@pms.com');
        console.log('Password: admin123');
        console.log('Role:     ADMIN');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  Please change the password after first login!');

        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
