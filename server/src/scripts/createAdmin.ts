import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import Admin from '../models/Admin';
import { connectDB } from '../config/db';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

const createAdmin = async () => {
  try {
    await connectDB();

    console.log('🚀 Zentroe Investment Admin Creation Tool\n');

    // Check if admin already exists
    const existingAdmins = await Admin.find();
    if (existingAdmins.length > 0) {
      console.log('📋 Existing Admins:');
      existingAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email}) - Role: ${admin.role} - Active: ${admin.isActive}`);
      });
      console.log('');
    }

    const createNew = await question('Do you want to create a new admin? (y/n): ');
    if (createNew.toLowerCase() !== 'y' && createNew.toLowerCase() !== 'yes') {
      console.log('Admin creation cancelled.');
      process.exit(0);
    }

    // Get admin details
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (minimum 6 characters): ');
    const roleInput = await question('Enter admin role (super_admin/admin) [default: admin]: ');
    const role = roleInput.trim() === 'super_admin' ? 'super_admin' : 'admin';

    // Validate input
    if (!name || !email || !password) {
      console.error('❌ Name, email, and password are required.');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters long.');
      process.exit(1);
    }

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.error('❌ Admin with this email already exists.');
      process.exit(1);
    }

    // Create admin
    const admin = new Admin({
      email: email.toLowerCase(),
      password,
      name,
      role
    });

    await admin.save();

    console.log('\n✅ Admin created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🔒 Password: [Hidden for security]');
    console.log('\n🌐 Admin Dashboard URL: http://localhost:3000/x-admin');
    console.log('⚠️  Please save these credentials safely!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

// Create default admin if run with --default flag
const createDefaultAdmin = async () => {
  try {
    await connectDB();

    // Check if any admin exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log('⚠️  Admin already exists. Use the interactive mode to create additional admins.');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      email: 'admin@zentroe.com',
      password: 'admin123', // Will be hashed automatically
      name: 'Default Admin',
      role: 'super_admin'
    });

    await admin.save();
    console.log('✅ Default admin created successfully!');
    console.log('📧 Email: admin@zentroe.com');
    console.log('🔒 Password: admin123');
    console.log('🌐 Admin Dashboard: http://localhost:3000/x-admin');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating default admin:', error.message);
    process.exit(1);
  }
};

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--default')) {
  createDefaultAdmin();
} else {
  createAdmin();
}

// Handle cleanup
process.on('SIGINT', () => {
  rl.close();
  mongoose.connection.close();
  process.exit(0);
});
