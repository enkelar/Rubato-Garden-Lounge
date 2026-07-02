import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: 'No description provided.' },
    price: { type: Number, required: true },
    image: { type: String, required: true, default: 'https://via.placeholder.com/400?text=Product' },
    details: { type: String, default: 'No additional details provided.' },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
});

export default mongoose.model('Product', productSchema);