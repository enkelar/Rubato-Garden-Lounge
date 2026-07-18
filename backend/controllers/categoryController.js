import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";
import cache from "../utils/cache.js";
import { generateSlug } from "../utils/slug.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryModel.find().sort({ name: 1 });
  res.status(200).json({ categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw httpError(400, "Name is required");

  const baseSlug = generateSlug(name);
  let slug = baseSlug;

  const existing = await categoryModel.findOne({ slug });
  if (existing) slug = `${baseSlug}-${Date.now()}`;

  const category = await categoryModel.create({ ...req.body, slug });
  cache.flushAll();
  res.status(201).json({ message: "Category created successfully", category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const updateData = { ...req.body };

  if (name) {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    const existing = await categoryModel.findOne({ slug, _id: { $ne: id } });
    if (existing) slug = `${baseSlug}-${Date.now()}`;
    updateData.slug = slug;
  }

  const category = await categoryModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!category) throw httpError(404, "Category not found");

  cache.flushAll();
  res.status(200).json({ message: "Category updated successfully", category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const productCount = await productModel.countDocuments({ category: id });
  if (productCount > 0) {
    throw httpError(
      409,
      `Cannot delete category — ${productCount} product(s) still reference it. Reassign or delete those products first.`
    );
  }

  const category = await categoryModel.findByIdAndDelete(id);
  if (!category) throw httpError(404, "Category not found");
  cache.flushAll();
  res.status(200).json({ message: "Category deleted successfully" });
});