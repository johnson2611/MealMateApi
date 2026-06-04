const { z } = require('zod');
const prisma = require('../config/prisma');

const mealPlanItemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  recipeId: z.string().uuid().optional(),
  externalRecipeId: z.string().optional(),
  externalRecipeTitle: z.string().optional(),
  externalRecipeImage: z.string().url().optional(),
  notes: z.string().optional(),
});

// Get the Monday of the current week
const getWeekStart = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getWeeklyPlan = async (req, res, next) => {
  try {
    const weekStart = getWeekStart(req.query.week);

    const mealPlan = await prisma.mealPlan.findUnique({
      where: { userId_weekStart: { userId: req.user.id, weekStart } },
      include: {
        items: {
          include: { recipe: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }],
        },
      },
    });

    if (!mealPlan) {
      return res.json({
        data: {
          weekStart,
          weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
          items: [],
        },
      });
    }

    res.json({ data: mealPlan });
  } catch (error) {
    next(error);
  }
};

const addMealToPlan = async (req, res, next) => {
  try {
    const item = mealPlanItemSchema.parse(req.body);
    const weekStart = getWeekStart(req.body.week);

    // Upsert the meal plan for the week
    const mealPlan = await prisma.mealPlan.upsert({
      where: { userId_weekStart: { userId: req.user.id, weekStart } },
      create: { userId: req.user.id, weekStart },
      update: {},
    });

    // Check if slot is already taken
    const existing = await prisma.mealPlanItem.findFirst({
      where: { mealPlanId: mealPlan.id, dayOfWeek: item.dayOfWeek, mealType: item.mealType },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Conflict',
        message: `A ${item.mealType} is already planned for that day`,
      });
    }

    const mealPlanItem = await prisma.mealPlanItem.create({
      data: { ...item, mealPlanId: mealPlan.id },
      include: { recipe: true },
    });

    res.status(201).json({ message: 'Meal added to plan', data: mealPlanItem });
  } catch (error) {
    next(error);
  }
};

const updateMealInPlan = async (req, res, next) => {
  try {
    const data = mealPlanItemSchema.partial().parse(req.body);

    const item = await prisma.mealPlanItem.findFirst({
      where: {
        id: req.params.itemId,
        mealPlan: { userId: req.user.id },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Meal plan item not found' });
    }

    const updated = await prisma.mealPlanItem.update({
      where: { id: req.params.itemId },
      data,
      include: { recipe: true },
    });

    res.json({ message: 'Meal updated', data: updated });
  } catch (error) {
    next(error);
  }
};

const removeMealFromPlan = async (req, res, next) => {
  try {
    const item = await prisma.mealPlanItem.findFirst({
      where: {
        id: req.params.itemId,
        mealPlan: { userId: req.user.id },
      },
    });

    if (!item) {
      return res.status(404).json({ error: 'Not Found', message: 'Meal plan item not found' });
    }

    await prisma.mealPlanItem.delete({ where: { id: req.params.itemId } });

    res.json({ message: 'Meal removed from plan' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWeeklyPlan, addMealToPlan, updateMealInPlan, removeMealFromPlan };
