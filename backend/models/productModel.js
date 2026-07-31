import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    nameSq: { type: String, trim: true },
    description: { type: String, required: false, default: 'No description provided.' },
    descriptionSq: { type: String, default: 'Nuk u dha përshkrim.' },
    price: { type: Number, required: true },
    image: { type: String, required: false, default: '/product-placeholder.svg' },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    }
});

export default mongoose.model('Product', productSchema);