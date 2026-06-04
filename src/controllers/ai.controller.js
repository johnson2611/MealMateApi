const Groq = require('groq-sdk');
const { z } = require('zod');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callGroq = async (prompt) => {
  const response = await groq.chat.completions.create({
    // model: 'llama3-8b-8192',
    model: 'llama-3.3-70b-versatile',

    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });
  const text = response.choices[0].message.content.trim();
  return text.replace(/```json|```/g, '').trim();
};

const suggestSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1, 'At least one ingredient required'),
  dietaryPreferences: z.array(z.string()).optional().default([]),
  cuisinePreference: z.string().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  maxTime: z.number().int().positive().optional(),
});

const suggestRecipes = async (req, res, next) => {
  try {
    const { ingredients, dietaryPreferences, cuisinePreference, mealType, maxTime } =
      suggestSchema.parse(req.body);

    const prompt = `You are a helpful chef assistant. Based on the following ingredients and preferences, suggest 3 recipe ideas.

Ingredients available: ${ingredients.join(', ')}
${dietaryPreferences.length ? `Dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${cuisinePreference ? `Cuisine preference: ${cuisinePreference}` : ''}
${mealType ? `Meal type: ${mealType}` : ''}
${maxTime ? `Maximum cooking time: ${maxTime} minutes` : ''}

Respond ONLY with a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "title": "Recipe Name",
    "description": "Brief description",
    "estimatedTime": 30,
    "difficulty": "easy|medium|hard",
    "keyIngredients": ["ingredient1", "ingredient2"],
    "missingIngredients": ["ingredient you might need to buy"],
    "steps": ["Step 1", "Step 2", "Step 3"]
  }
]`;

    const clean = await callGroq(prompt);
    const suggestions = JSON.parse(clean);

    res.json({
      message: 'Recipe suggestions generated',
      data: suggestions,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: 'Parse Error',
        message: 'AI returned unexpected format, please try again',
      });
    }
    next(error);
  }
};

const generateShoppingList = async (req, res, next) => {
  try {
    const { recipes } = req.body;

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'recipes array is required' });
    }

    const prompt = `You are a helpful meal planning assistant. Given these recipes:
${recipes.map((r, i) => `${i + 1}. ${r.title}: ${r.ingredients?.join(', ')}`).join('\n')}

Generate a consolidated, organized shopping list. Group by category (Produce, Meat & Seafood, Dairy, Pantry, etc.) and combine duplicate ingredients.

Respond ONLY with valid JSON (no markdown):
{
  "categories": [
    {
      "name": "Produce",
      "items": [
        { "name": "tomatoes", "quantity": "4", "unit": "medium" }
      ]
    }
  ],
  "estimatedCost": "approximate cost in USD"
}`;

    const clean = await callGroq(prompt);
    const shoppingList = JSON.parse(clean);

    res.json({ message: 'Shopping list generated', data: shoppingList });
  } catch (error) {
    next(error);
  }
};

const analyzeMealPlan = async (req, res, next) => {
  try {
    const { meals } = req.body;

    if (!meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: 'Bad Request', message: 'meals array is required' });
    }

    const prompt = `As a nutritionist, analyze this weekly meal plan and provide feedback:

${meals.map((m) => `- ${m.mealType} on day ${m.dayOfWeek}: ${m.title}`).join('\n')}

Respond ONLY with valid JSON:
{
  "overallBalance": "assessment of nutritional balance",
  "strengths": ["strength 1", "strength 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "estimatedCaloriesPerDay": 2000,
  "nutritionTips": "personalized tip"
}`;

    const clean = await callGroq(prompt);
    const analysis = JSON.parse(clean);

    res.json({ message: 'Meal plan analyzed', data: analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = { suggestRecipes, generateShoppingList, analyzeMealPlan };
