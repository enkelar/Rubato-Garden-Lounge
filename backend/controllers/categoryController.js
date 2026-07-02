import categoryModel from "../models/categoryModel.js";

export const getCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find().sort({ name: 1 });
        res.status(200).json({ categories });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const category = await categoryModel.create(req.body);
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await categoryModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ message: 'Category updated successfully', category });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const category = await categoryModel.findByIdAndDelete(req.params.id);
        if(!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}