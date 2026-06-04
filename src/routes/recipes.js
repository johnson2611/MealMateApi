// src/routes/recipes.js
const router = require('express').Router();
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipes.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     summary: Get all your saved recipes
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of recipes with pagination }
 *   post:
 *     summary: Create a new recipe
 *     tags: [Recipes]
 *     responses:
 *       201: { description: Recipe created }
 */
router.get('/', getAllRecipes);
router.post('/', createRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Recipe found }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a recipe
 *     tags: [Recipes]
 *     responses:
 *       200: { description: Recipe updated }
 *   delete:
 *     summary: Delete a recipe
 *     tags: [Recipes]
 *     responses:
 *       200: { description: Recipe deleted }
 */
router.get('/:id', getRecipeById);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

module.exports = router;
