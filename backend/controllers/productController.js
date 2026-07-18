import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productModel.find().populate('category', 'name slug').sort({ name: 1 });
  res.status(200).json({ products });
});

export const getProductsByCategoryId = asyncHandler(async (req, res) => {
  const products = await productModel.find({ category: req.params.categoryId }).sort({ name: 1 });
  res.status(200).json({ products });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productModel.create(req.body);
  cache.flushAll();
  res.status(201).json({ message: "Product created", product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw httpError(404, "Product not found");
  cache.flushAll();
  res.status(200).json({ message: "Product updated", product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productModel.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, "Product not found");
  cache.flushAll();
  res.status(200).json({ message: "Product deleted" });
});