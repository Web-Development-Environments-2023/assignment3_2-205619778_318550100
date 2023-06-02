var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns the recipes for a search by cusine, diet or intolerance
 */
router.get('/search', async (req,res,next) => {
  try {
    const user_id = req.session.user_id;
    let search_recipes = await recipes_utils.getSearchRecipes(req.query.query, req.query.number, req.query.cuisine, req.query.diet, req.query.intolerance,req.query.sort);
    if (user_id){
      req.session.lastSearch = search_recipes;
    }
    res.send(search_recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a preview details of three random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    let random_three_recipe = await recipes_utils.getThreeRandomRecipes(user_id);
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
    const user_id = req.session.user_id;
    if (user_id){
      await user_utils.markAsWatched(user_id, req.params.recipeId);
    }
    const recipe = await recipes_utils.getRecipeFullDetails(req.params.recipeId, user_id);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


module.exports = router;  
