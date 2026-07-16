import categoryModel from "../models/categoryModel.js";
import cache from "../utils/cache.js";
import { generateSlug } from "../utils/slug.js"; // ← adjust path if different

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find().sort({ name: 1 });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const baseSlug = generateSlug(name);
    let slug = baseSlug;

    // Ensure slug uniqueness
    let existing = await categoryModel.findOne({ slug });
    if (existing) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const categoryData = { ...req.body, slug };

    const category = await categoryModel.create(categoryData);
    cache.flushAll();

    res.status(201).json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category by ID
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updateData = { ...req.body };

    // If name changes, regenerate slug
    if (name) {
      const baseSlug = generateSlug(name);
      let slug = baseSlug;

      // Find other categories with the same slug (exclude current)
      let existing = await categoryModel.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        slug = `${baseSlug}-${Date.now()}`;
      }

      updateData.slug = slug;
    }

    const category = await categoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) return res.status(404).json({ message: "Category not found" });

    cache.flushAll();
    res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category by ID
export const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModel.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    cache.flushAll();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};