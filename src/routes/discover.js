// src/routes/discover.js
const router = require('express').Router();
const { searchRecipes, getRecipeDetails, getRandomRecipes } = require('../controllers/discover.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/discover:
 *   get:
 *     summary: Search recipes via Spoonacular
 *     tags: [Discover]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema: { type: string }
 *         description: Search term (e.g. "pasta", "jollof rice")
 *       - in: query
 *         name: cuisine
 *         schema: { type: string }
 *       - in: query
 *         name: diet
 *         schema: { type: string, enum: [vegetarian, vegan, gluten-free, ketogenic] }
 *       - in: query
 *         name: maxReadyTime
 *         schema: { type: integer }
 *       - in: query
 *         name: number
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Recipe search results }
 */
router.get('/', searchRecipes);

/**
 * @swagger
 * /api/discover/random:
 *   get:
 *     summary: Get random recipes
 *     tags: [Discover]
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *       - in: query
 *         name: number
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200: { description: Random recipes }
 */
router.get('/random', getRandomRecipes);

/**
 * @swagger
 * /api/discover/{id}:
 *   get:
 *     summary: Get full recipe details from Spoonacular
 *     tags: [Discover]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Recipe details }
 *       404: { description: Not found }
 */
router.get('/:id', getRecipeDetails);

module.exports = router;
