import categoryModel from "../models/categoryModel.js";
import cache from "../utils/cache.js";

// Get all categories
export const getCategories = async (req, res) => {
    try {
        // Find all categories and sort them by name - ascending order
        const categories = await categoryModel.find().sort({ name: 1 });
        res.status(200).json({ categories });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new category
export const createCategory = async (req, res) => {
    try {
        const category = await categoryModel.create(req.body);
        // Clear all cached data because the categories list changed
        cache.flushAll();
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a category by ID 
export const updateCategory = async (req, res) => {
    try {
        const category = await categoryModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // return updated not old doc
            runValidators: true // run schema validation on the updated data
        });
        if(!category) return res.status(404).json({ message: 'Category not found' });
        cache.flushAll();
        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Delete a category by ID 
export const deleteCategory = async (req, res) => {
    try {
        const category = await categoryModel.findByIdAndDelete(req.params.id);
        if(!category) return res.status(404).json({ message: 'Category not found' });
        cache.flushAll();
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}