const router = require('express').Router();
const {
  getWeeklyPlan,
  addMealToPlan,
  updateMealInPlan,
  removeMealFromPlan,
} = require('../controllers/mealplan.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/mealplan/week:
 *   get:
 *     summary: Get weekly meal plan
 *     tags: [Meal Plan]
 *     parameters:
 *       - in: query
 *         name: week
 *         description: Any date in the desired week (defaults to current week)
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Weekly meal plan }
 */
router.get('/week', getWeeklyPlan);

/**
 * @swagger
 * /api/mealplan:
 *   post:
 *     summary: Add a meal to the plan
 *     tags: [Meal Plan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dayOfWeek, mealType]
 *             properties:
 *               dayOfWeek: { type: integer, minimum: 0, maximum: 6, description: "0=Mon, 6=Sun" }
 *               mealType: { type: string, enum: [breakfast, lunch, dinner, snack] }
 *               recipeId: { type: string, format: uuid }
 *               week: { type: string, format: date }
 *     responses:
 *       201: { description: Meal added }
 *       409: { description: Slot already taken }
 */
router.post('/', addMealToPlan);

/**
 * @swagger
 * /api/mealplan/{itemId}:
 *   put:
 *     summary: Update a meal in the plan
 *     tags: [Meal Plan]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Meal updated }
 *   delete:
 *     summary: Remove a meal from the plan
 *     tags: [Meal Plan]
 *     responses:
 *       200: { description: Meal removed }
 */
router.put('/:itemId', updateMealInPlan);
router.delete('/:itemId', removeMealFromPlan);

module.exports = router;
