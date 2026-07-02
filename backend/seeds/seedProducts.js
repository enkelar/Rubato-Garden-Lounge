import dotenv from 'dotenv';
import connectDB from '../db.js';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

dotenv.config();

// Sample product data organized by category
const productData = {
    'Soup': [
        { name: 'Tomato Basil Soup', description: 'Rich tomato soup with fresh basil and cream', price: 8.99, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500', details: 'Made with fresh Roma tomatoes, fresh basil, and a touch of cream' },
        { name: 'Chicken Noodle Soup', description: 'Classic comfort soup with tender chicken and vegetables', price: 9.99, image: 'https://images.unsplash.com/photo-1666553895340-a8a6ee0d58e3?w=500', details: 'Warm, comforting soup with homemade broth, tender chicken, and fresh vegetables' },
        { name: 'Butternut Squash Soup', description: 'Creamy roasted butternut squash with warming spices', price: 8.49, image: 'https://images.unsplash.com/photo-1620519238901-3f6f1a47f0f3?w=500', details: 'Silky smooth butternut squash soup with nutmeg, ginger, and a hint of cinnamon' },
    ],
    'Breakfast': [
        { name: 'Classic Pancakes', description: 'Fluffy buttermilk pancakes with maple syrup', price: 12.99, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500', details: 'Stack of 3 fluffy pancakes served with butter and pure maple syrup' },
        { name: 'Avocado Toast', description: 'Sourdough toast with smashed avocado and poached egg', price: 11.99, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500', details: 'Crispy sourdough toast topped with creamy avocado, poached egg, red pepper, and sea salt' },
        { name: 'Breakfast Burrito', description: 'Scrambled eggs, chorizo, cheese, and salsa wrapped in a tortilla', price: 13.49, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500', details: 'Warm flour tortilla filled with scrambled eggs, spicy chorizo, cheddar cheese, and pico de gallo' },
    ],
    'Salads': [
        { name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons with creamy Caesar dressing', price: 10.99, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500', details: 'Crisp romaine lettuce tossed in our house-made Caesar dressing with fresh parmesan and housemade croutons' },
        { name: 'Greek Salad', description: 'Fresh tomatoes, cucumbers, feta, olives with Greek dressing', price: 11.49, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500', details: 'Fresh tomatoes, crisp cucumbers, Kalamata olives, and creamy feta cheese with oregano vinaigrette' },
        { name: 'Cobb Salad', description: 'Grilled chicken, bacon, avocado, blue cheese, and hard-boiled eggs', price: 13.99, image: 'https://images.unsplash.com/photo-1495237868371-85342d5e5c44?w=500', details: 'Chopped salad with grilled chicken, crispy bacon, avocado, blue cheese, hard-boiled eggs, and mixed greens' },
    ],
    'Sandwiches': [
        { name: 'Club Sandwich', description: 'Triple-decker with turkey, bacon, lettuce, and tomato', price: 12.99, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', details: 'Three layers of bread with roasted turkey, crispy bacon, fresh lettuce, ripe tomato, and mayo' },
        { name: 'Philly Cheesesteak', description: 'Thinly sliced steak with melted provolone and peppers', price: 14.99, image: 'https://images.unsplash.com/photo-1552040237-470a08a78da9?w=500', details: 'Sliced Ribeye steak with sautéed onions and peppers, topped with melted provolone on a hoagie roll' },
        { name: 'Chicken Pesto Panini', description: 'Grilled chicken with pesto, mozzarella, and roasted peppers', price: 13.49, image: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=500', details: 'Pressed panini with grilled chicken breast, fresh pesto, fresh mozzarella, and roasted red peppers' },
    ],
    'Burger': [
        { name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce', price: 15.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', details: 'Half-pound char-grilled beef patty with lettuce, tomato, pickles, onion, and our signature burger sauce' },
        { name: 'Bacon Cheeseburger', description: 'Beef patty with crispy bacon, cheddar, and caramelized onions', price: 17.49, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500', details: 'Half-pound beef patty topped with crispy bacon, aged cheddar cheese, and caramelized sweet onions' },
        { name: 'Mushroom Swiss Burger', description: 'Beef patty with sautéed mushrooms and melted Swiss cheese', price: 16.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', details: 'Half-pound beef patty topped with sautéed button and portobello mushrooms and Swiss cheese' },
    ],
    'Pasta': [
        { name: 'Spaghetti Carbonara', description: 'Classic Roman pasta with eggs, pecorino, pancetta, and black pepper', price: 16.99, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500', details: 'Authentic Italian pasta tossed with eggs, guanciale, pecorino Romano, and freshly cracked black pepper' },
        { name: 'Fettuccine Alfredo', description: 'Creamy pasta with Parmesan cheese and fresh herbs', price: 15.99, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500', details: 'Fettuccine in a rich Alfredo sauce made with butter, cream, and freshly grated Parmesan cheese' },
        { name: 'Lasagna', description: 'Layered pasta with meat sauce, ricotta, and mozzarella cheese', price: 17.99, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500', details: 'Traditional lasagna with layers of pasta, meat sauce, creamy ricotta, and melted mozzarella' },
    ],
    'Risotto': [
        { name: 'Mushroom Risotto', description: 'Creamy Arborio rice with wild mushrooms and truffle oil', price: 18.99, image: 'https://images.unsplash.com/photo-1476124369162-f4978c91c4e0?w=500', details: 'Creamy Arborio rice cooked with white wine, vegetable broth, wild mushrooms, and finished with truffle oil' },
        { name: 'Seafood Risotto', description: 'Arborio rice with shrimp, scallops, and fresh herbs', price: 20.99, image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=500', details: 'Creamy seafood risotto with fresh shrimp, scallops, white wine, saffron, and fresh parsley' },
        { name: 'Saffron Risotto', description: 'Classic Milanese risotto with saffron and Parmesan', price: 17.49, image: 'https://images.unsplash.com/photo-1482384452993-b546fdc0149f?w=500', details: 'Traditional Milanese risotto infused with saffron, cooked in vegetable broth, finished with Parmesan' },
    ],
    'Pizza': [
        { name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, basil, and olive oil', price: 14.99, image: 'https://images.unsplash.com/photo-1574071318508-1cdbed80d1dd?w=500', details: 'Wood-fired pizza with San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil' },
        { name: 'Pepperoni Pizza', description: 'Classic tomato sauce with mozzarella and pepperoni', price: 16.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07f4ee?w=500', details: 'Classic pizza with tomato sauce, mozzarella cheese, and slices of premium Italian pepperoni' },
        { name: 'Vegetarian Pizza', description: 'Bell peppers, mushrooms, olives, and onions with mozzarella', price: 15.99, image: 'https://images.unsplash.com/photo-1511689915989-48d1c41edafb?w=500', details: 'Wood-fired vegetarian pizza with bell peppers, mushrooms, Kalamata olives, red onions, and mozzarella' },
    ],
    'Fajitas': [
        { name: 'Chicken Fajitas', description: 'Grilled chicken with peppers and onions, served with tortillas', price: 18.99, image: 'https://images.unsplash.com/photo-1594060409263-4c529f93590b?w=500', details: 'Sizzling platter of grilled chicken breast with bell peppers, onions, served with warm flour tortillas' },
        { name: 'Steak Fajitas', description: 'Marinated skirt steak with sautéed vegetables', price: 20.99, image: 'https://images.unsplash.com/photo-1506756381912-a05a1cfe8bae?w=500', details: 'Sizzling marinated skirt steak with grilled bell peppers and onions, served with warm tortillas and garnishes' },
        { name: 'Shrimp Fajitas', description: 'Grilled shrimp with bell peppers and onions', price: 19.99, image: 'https://images.unsplash.com/photo-1599349810694-b5ac9b764fd4?w=500', details: 'Succulent grilled shrimp with sautéed bell peppers and onions, served with warm flour tortillas' },
    ],
    'Main Plate': [
        { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon herb butter and seasonal vegetables', price: 22.99, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', details: 'Pan-seared Atlantic salmon fillet with lemon herb butter, served with seasonal vegetables and rice' },
        { name: 'Steak Frites', description: 'Grilled New York strip with crispy fries and peppercorn sauce', price: 24.99, image: 'https://images.unsplash.com/photo-1599599810694-e4e7b0e5e6d0?w=500', details: 'Premium New York strip steak with crispy French fries and our house-made peppercorn sauce' },
        { name: 'Chicken Parmigiana', description: 'Breaded chicken breast with marinara and melted cheese', price: 19.99, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500', details: 'Breaded chicken breast fried until golden, topped with marinara sauce and melted mozzarella cheese' },
    ],
    'Finger Foods': [
        { name: 'Loaded Nachos', description: 'Crispy tortilla chips with cheese, jalapeños, and guacamole', price: 11.99, image: 'https://images.unsplash.com/photo-1513456852971-28c0b7f24f1d?w=500', details: 'Crispy tortilla chips piled high with melted cheese, jalapeños, guacamole, sour cream, and salsa' },
        { name: 'Chicken Wings', description: 'Crispy wings with choice of buffalo or BBQ sauce', price: 12.99, image: 'https://images.unsplash.com/photo-1598566174192-0173432dba11?w=500', details: 'Fried chicken wings tossed in your choice of spicy buffalo sauce or smoky BBQ sauce' },
        { name: 'Mozzarella Sticks', description: 'Breaded mozzarella with marinara dipping sauce', price: 9.99, image: 'https://images.unsplash.com/photo-1599599810694-e4e7b0e5e6d0?w=500', details: 'Six golden-fried mozzarella sticks served with warm marinara sauce for dipping' },
    ]
};

async function seedProducts() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Clear existing products   
        // await Product.deleteMany({});
        // console.log('Cleared existing products');

        // Get all categories
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories`);

        let totalProductsCreated = 0;

        // For each category, create products
        for (const category of categories) {
            const categoryProducts = productData[category.name];

            if (categoryProducts) {
                // Add category reference to each product
                const productsWithCategory = categoryProducts.map(product => ({
                    ...product,
                    category: category._id
                }));

                const inserted = await Product.insertMany(productsWithCategory);
                console.log(`Created ${inserted.length} products for ${category.name}`);
                totalProductsCreated += inserted.length;
            } else {
                console.log(`No products found for category: ${category.name}`);
            }
        }

        console.log(`\n✅ Successfully created ${totalProductsCreated} products total`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to seed products:', error.message);
        process.exit(1);
    }
}

seedProducts();