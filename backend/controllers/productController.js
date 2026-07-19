import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";
import { deleteR2ObjectByUrl } from "../utils/r2Delete.js";

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
  const existing = await productModel.findById(req.params.id);
  if (!existing) throw httpError(404, "Product not found");
  const oldImage = existing.image;

  const product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if ('image' in req.body && oldImage && oldImage !== req.body.image) {
    await deleteR2ObjectByUrl(oldImage);
  }

  cache.flushAll();
  res.status(200).json({ message: "Product updated", product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productModel.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, "Product not found");
  await deleteR2ObjectByUrl(product.image);
  cache.flushAll();
  res.status(200).json({ message: "Product deleted" });
});