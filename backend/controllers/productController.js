import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";

export const getAllProducts = async (req, res) => {
  try {
    // find all products, populate the category field with only name and slug, then sort by product name
    const products = await productModel.find().populate('category', 'name slug').sort({ name: 1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category ID
export const getProductsByCategoryId = async (req, res) => {
  try {
    // Find products whose category matched the categoryId from the URL
    const products = await productModel.find({ category: req.params.categoryId }).sort({ name: 1 });
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const product = await productModel.create(req.body);
    cache.flushAll(); // clear cache bc product data changed
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return updated doc
      runValidators: true // validate
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    cache.flushAll();
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    // Find the product by ID and delete it
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    cache.flushAll();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};