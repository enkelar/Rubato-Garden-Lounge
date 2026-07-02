import dotenv from 'dotenv';
import connectDB from '../db.js';
import { Admin } from '../models/userModel.js';

dotenv.config();

async function seedAdmin() {
    try {
        await connectDB();
        console.log('Connected to database');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@rubato.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'RubatoAdmin123!';
        const adminName = process.env.ADMIN_NAME || 'Admin';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log(' Admin already exists, skipping creation');
            console.log(`   Email: ${existingAdmin.email}`);
            return process.exit(0);
        }

        // Create new admin (password will be auto-hashed by pre-save middleware)
        const admin = new Admin({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            isAdmin: true
        });

        await admin.save();
        
        console.log(' Admin created successfully:');
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('\n  Save these credentials and delete this log!');

        process.exit(0);
    } catch (error) {
        console.error(' Failed to seed admin:', error.message);
        process.exit(1);
    }
}

seedAdmin();