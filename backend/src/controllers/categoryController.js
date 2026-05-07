const { Category } = require('../models');

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });

    const existing = await Category.findOne({ where: { name } });
    if (existing) return res.status(409).json({ success: false, message: 'Category already exists.' });

    const category = await Category.create({ name, description, icon, color });
    return res.status(201).json({ success: true, message: 'Category created.', data: category });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const { name, description, icon, color } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    return res.status(200).json({ success: true, message: 'Category updated.', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    await category.destroy();
    return res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
