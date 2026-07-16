import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    nameSq: { type: String, trim: true },
    description: { type: String, required: false, default: 'No description provided.' },
    descriptionSq: { type: String, default: 'Nuk u dha përshkrim.' },
    price: { type: Number, required: true },
    image: { type: String, required: false, default: 'https://via.placeholder.com/400?text=Product' },
    details: { type: String, default: 'No additional details provided.' },
    detailsSq: { type: String, default: 'Nuk u dhanë detaje shtesë.' },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    }
});

export default mongoose.model('Product', productSchema);