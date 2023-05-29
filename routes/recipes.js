var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/RecipeDetailsAPI/:recipeId", async (req, res, next) => {
  try {
    const full_recipe = await recipes_utils.getFullRecipeDetails(req.params.recipeId);
    res.send(full_recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the recipes for an Unauthorized USER that the user search by cusine, diet or intolerance
 */
router.get('/search', async (req,res,next) => {
  try {
    let sreach_recipes = await recipes_utils.getSearchRecipes(req.query.query, req.query.number, req.query.cuisine, req.query.diet, req.query.intolerance,req.query.sort);
    res.send(sreach_recipes);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    let random_three_recipe = await recipes_utils.getRandomThreeRecipes();
    res.send(random_three_recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


module.exports = router;  
