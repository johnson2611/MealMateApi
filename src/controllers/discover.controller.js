const axios = require('axios');

const spoonacular = axios.create({
  baseURL: process.env.SPOONACULAR_BASE_URL || 'https://api.spoonacular.com',
  params: { apiKey: process.env.SPOONACULAR_API_KEY },
});

const searchRecipes = async (req, res, next) => {
  try {
    const {
      query,
      cuisine,
      diet,
      intolerances,
      maxReadyTime,
      number = 10,
      offset = 0,
    } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Bad Request', message: 'query param is required' });
    }

    const response = await spoonacular.get('/recipes/complexSearch', {
      params: {
        query,
        cuisine,
        diet,
        intolerances,
        maxReadyTime,
        number,
        offset,
        addRecipeInformation: true,
        fillIngredients: true,
      },
    });

    const { results, totalResults } = response.data;

    res.json({
      data: results.map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        readyInMinutes: r.readyInMinutes,
        servings: r.servings,
        cuisines: r.cuisines,
        diets: r.diets,
        summary: r.summary?.replace(/<[^>]*>/g, ''), // strip HTML
      })),
      pagination: {
        total: totalResults,
        offset: Number(offset),
        number: Number(number),
      },
    });
  } catch (error) {
    if (error.response?.status === 402) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Recipe discovery API quota exceeded',
      });
    }
    next(error);
  }
};

const getRecipeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await spoonacular.get(`/recipes/${id}/information`, {
      params: { includeNutrition: false },
    });

    const r = response.data;

    res.json({
      data: {
        id: r.id,
        title: r.title,
        image: r.image,
        readyInMinutes: r.readyInMinutes,
        servings: r.servings,
        cuisines: r.cuisines,
        diets: r.diets,
        ingredients: r.extendedIngredients?.map((i) => ({
          name: i.name,
          amount: i.amount,
          unit: i.unit,
          original: i.original,
        })),
        instructions: r.analyzedInstructions?.[0]?.steps?.map((s) => s.step) || [],
        sourceUrl: r.sourceUrl,
        summary: r.summary?.replace(/<[^>]*>/g, ''),
      },
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'Not Found', message: 'Recipe not found' });
    }
    next(error);
  }
};

const getRandomRecipes = async (req, res, next) => {
  try {
    const { tags, number = 5 } = req.query;

    const response = await spoonacular.get('/recipes/random', {
      params: { tags, number },
    });

    res.json({
      data: response.data.recipes.map((r) => ({
        id: r.id,
        title: r.title,
        image: r.image,
        readyInMinutes: r.readyInMinutes,
        servings: r.servings,
        diets: r.diets,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchRecipes, getRecipeDetails, getRandomRecipes };
