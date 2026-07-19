import mongoose from 'mongoose';
import { generateSlug } from '../utils/slug.js';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  nameSq: { type: String },
  slug: { type: String, required: true, unique: true, lowercase: true },
  icon: { type: String, default: '🍽️' },
  cover: { type: String, default: '/category-placeholder.svg' },
  note: { type: String },
  noteSq: { type: String },
  order: { type: Number, default: 0, index: true },
});

// Generates slug before saving the category
categorySchema.pre("save", function () {
  if (this.isModified("name") || !this.slug) {
    this.slug = generateSlug(this.name);
  }
});

export default mongoose.model('Category', categorySchema);