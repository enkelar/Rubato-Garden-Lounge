import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    nameSq: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    descriptionSq: { type: String },
    icon: { type: String, default: '🍽️' },
    cover: { type: String, default: 'https://via.placeholder.com/400?text=Category' },
    note: { type: String },
    noteSq: { type: String }
});

// Generates slug before saving the category
categorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

export default mongoose.model('Category', categorySchema);