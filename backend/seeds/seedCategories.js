import dotenv from 'dotenv';
import connectDB from '../db.js';
import Category from '../models/categoryModel.js';

dotenv.config();

const categories = [
    { name: 'Soup', slug: 'soup', icon: '🍲', cover: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', note: 'Perfect comfort food' },
    { name: 'Breakfast', slug: 'breakfast', icon: '🥞', cover: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500', note: 'Morning favorites' },
    { name: 'Salads', slug: 'salads', icon: '🥗', cover: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500', note: 'Light & nutritious' },
    { name: 'Sandwiches', slug: 'sandwiches', icon: '🥪', cover: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', note: 'Handheld delights' },
    { name: 'Burger', slug: 'burger', icon: '🍔', cover: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', note: 'Bold flavors' },
    { name: 'Pasta', slug: 'pasta', icon: '🍝', cover: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500', note: 'Italian classics' },
    { name: 'Risotto', slug: 'risotto', icon: '🍚', cover: 'https://images.unsplash.com/photo-1476124369162-f4978c91c4e0?w=500', note: 'Creamy indulgence' },
    { name: 'Pizza', slug: 'pizza', icon: '🍕', cover: 'https://images.unsplash.com/photo-1574071318508-1cdbed80d1dd?w=500', note: 'Baked perfection' },
    { name: 'Fajitas', slug: 'fajitas', icon: '🌮', cover: 'https://images.unsplash.com/photo-1594060409263-4c529f93590b?w=500', note: 'Sizzling hot' },
    { name: 'Main Plate', slug: 'main-plate', icon: '🍖', cover: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', note: 'Signature dishes' },
    { name: 'Finger Foods', slug: 'finger-foods', icon: '🍟', cover: 'https://images.unsplash.com/photo-1513456852971-28c0b7f24f1d?w=500', note: 'Shareable bites' }
];

async function seedCategories() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Clear existing categories (optional)
        // await Category.deleteMany({});
        // console.log('Cleared existing categories');

        // Insert all categories
        const inserted = await Category.insertMany(categories);
        console.log(`Created ${inserted.length} categories:`);
        inserted.forEach(cat => console.log(`   - ${cat.name} (slug: ${cat.slug})`));

        process.exit(0);
    } catch (error) {
        console.error('Failed to seed categories:', error.message);
        process.exit(1);
    }
}

seedCategories();