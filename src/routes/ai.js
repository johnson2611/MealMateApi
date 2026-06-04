const router = require('express').Router();
const { suggestRecipes, generateShoppingList, analyzeMealPlan } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'Too Many Requests', message: 'AI endpoint limit: 20 requests/hour' },
});

router.use(authenticate, aiLimiter);

/**
 * @swagger
 * /api/ai/suggest:
 *   post:
 *     summary: Get AI-powered recipe suggestions based on your ingredients
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ingredients]
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["eggs", "tomatoes", "onions"]
 *               dietaryPreferences:
 *                 type: array
 *                 items: { type: string }
 *               cuisinePreference: { type: string }
 *               mealType: { type: string, enum: [breakfast, lunch, dinner, snack] }
 *               maxTime: { type: integer, description: Max cook time in minutes }
 *     responses:
 *       200: { description: 3 recipe suggestions }
 */
router.post('/suggest', suggestRecipes);

/**
 * @swagger
 * /api/ai/shopping-list:
 *   post:
 *     summary: Generate a shopping list from a set of recipes
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipes]
 *             properties:
 *               recipes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     ingredients: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Categorized shopping list }
 */
router.post('/shopping-list', generateShoppingList);

/**
 * @swagger
 * /api/ai/analyze:
 *   post:
 *     summary: Analyze your weekly meal plan for nutritional balance
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [meals]
 *             properties:
 *               meals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     mealType: { type: string }
 *                     dayOfWeek: { type: integer }
 *     responses:
 *       200: { description: Nutritional analysis and tips }
 */
router.post('/analyze', analyzeMealPlan);

module.exports = router;
