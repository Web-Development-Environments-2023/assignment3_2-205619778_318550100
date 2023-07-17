var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});

/**
 * This path gets body with full recipe details and creates new private recipe
 */
router.post('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let {title, readyInMinutes, image, vegan, vegetarian, glutenFree, ingredients, instructions, servings} = req.body;
    // Check if all required parameters are provided
    if (!title || !readyInMinutes || !image || !ingredients || !instructions || !servings) {
      throw { status: 400, message: `Missing required parameters`};
    }
    // If all parameters are provided
    const Recipe = {
      title: title,
      readyInMinutes: readyInMinutes,
      image: image,
      vegan: vegan,
      vegetarian: vegetarian,
      glutenFree: glutenFree,
      ingredients: ingredients,
      instructions: instructions,
      servings: servings
    };
    await user_utils.createPrivateRecipes(user_id, Recipe);
    res.status(201).send("The private recipe successfully created");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the private recipes that were created by the logged-in user
 */
router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const private_recipes = await user_utils.getPreviewPrivateRecipe(user_id);
    res.status(200).send(private_recipes);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the private recipe with the specified recipeId
 */
router.get('/myRecipes/:recipeId', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    const private_recipe = await user_utils.getFullPrivateRecipe(user_id, recipe_id);
    if (private_recipe.length === 0){
      throw { status: 404, message: `Private recipe with ID ${recipe_id} does not exist`};
    }
    res.status(200).send(private_recipe);
  } catch(error){
    next(error); 
  }
});


/**
 * This path returns the recipes that the user search by cusine, diet or intolerance
 */
router.get('/familyRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_info = await user_utils.getPreviewFamilyRecipes(user_id);
    res.status(200).send(recipes_info);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the family recipe with the specified recipeId
 */
router.get('/familyRecipes/:recipeId', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;
    const recipe_info = await user_utils.getFullFamilyRecipes(user_id, recipe_id);
    if (recipe_info.length === 0){
      throw { status: 404, message: `Family recipe with ID ${recipe_id} does not exist`};
    }
    res.status(200).send(recipe_info);
  } catch(error){
    next(error); 
  }
});

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    // Check if the recipe with the given ID exists
    const recipes_info = await recipe_utils.getRecipePreviewDetails(recipe_id);
    if (!recipes_info){
      throw { status: 404, message: `Recipe with ID ${recipe_id} does not exist`};
    }
    // If exist, then add it to favorites list of the logged-in user
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(201).send(`The recipe with ID ${recipe_id} was successfully saved in the favorites list`);
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    let recipes_favorites = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    for(let i=0; i<recipes_id_array.length;i++){
      recipes_favorites.push(await recipe_utils.getRecipePreviewDetails(recipes_id_array[i],user_id))
    }
    res.status(200).send(recipes_favorites);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the 3 last recipes that the logged-in user watched
 */
router.get('/lastWatchedRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getLastWatchedRecipes(user_id, 3);
    let recipes_id_array = []
    let last_watched_recipes = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    for(let i=0; i<recipes_id_array.length;i++){
      last_watched_recipes.push(await recipe_utils.getRecipePreviewDetails(recipes_id_array[i],user_id))
    }

    res.status(200).send(last_watched_recipes);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns all the recipes that the logged-in user watched
 */
router.get('/allWatchedRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getAllWatchedRecipes(user_id);
    let recipes_id_array = []
    let watched_recipes = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    for(let i=0; i<recipes_id_array.length;i++){
      watched_recipes.push(await recipe_utils.getRecipePreviewDetails(recipes_id_array[i],user_id))
    }
    res.status(200).send(watched_recipes);
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns the last search results of the logged-in user.
 * If the user disconnects from the site/connects from another browser, 
 * the last search results will not be shown.
 */
router.get('/lastSearch', async (req,res,next) => {
  try{
    const lastSearch = req.session.lastSearch;
    res.status(200).send(lastSearch);
  } catch(error){
    next(error); 
  }
});


module.exports = router;
