// src/controllers/recipes.controller.js
const { z } = require('zod');
const prisma = require('../config/prisma');

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().optional(),
});

const recipeSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient required'),
  instructions: z.array(z.string().min(1)).min(1, 'At least one instruction required'),
  prepTime: z.number().int().positive().optional(),
  cookTime: z.number().int().positive().optional(),
  servings: z.number().int().positive().optional(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(false),
});

const getAllRecipes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId: req.user.id,
      ...(tag && { tags: { has: tag } }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
    };

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.recipe.count({ where }),
    ]);

    res.json({
      data: recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Not Found', message: 'Recipe not found' });
    }

    res.json({ data: recipe });
  } catch (error) {
    next(error);
  }
};

const createRecipe = async (req, res, next) => {
  try {
    const data = recipeSchema.parse(req.body);

    const recipe = await prisma.recipe.create({
      data: { ...data, userId: req.user.id },
    });

    res.status(201).json({ message: 'Recipe created', data: recipe });
  } catch (error) {
    next(error);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const data = recipeSchema.partial().parse(req.body);

    const existing = await prisma.recipe.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: 'Recipe not found' });
    }

    const recipe = await prisma.recipe.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ message: 'Recipe updated', data: recipe });
  } catch (error) {
    next(error);
  }
};

const deleteRecipe = async (req, res, next) => {
  try {
    const existing = await prisma.recipe.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Not Found', message: 'Recipe not found' });
    }

    await prisma.recipe.delete({ where: { id: req.params.id } });

    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };
