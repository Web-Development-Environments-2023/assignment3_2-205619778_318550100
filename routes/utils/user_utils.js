const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

async function markAsWatched(user_id, recipe_id){
    await DButils.execQuery(`insert into watchedrecipes values ('${user_id}',${recipe_id}, CURRENT_TIMESTAMP) on duplicate key update watched_at=values(watched_at)`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getFamilyRecipes(user_id){
    const recipes_details = await DButils.execQuery(`select recipe_id as id, title,image,readyInMinutes, vegan, vegetarian, glutenFree, creator, customary, ingredients, instructions, servings, imgstep1, imgstep2, imgstep3, imgstep4, imgstep5, imgstep6  from familyrecipes where user_id='${user_id}'`);
    return recipes_details;
}

async function createPrivateRecipes(user_id, Recipe){
    ingredients_as_JSON = JSON.stringify(Recipe.ingredients);
    instructions_as_JSON = JSON.stringify(Recipe.instructions);
    await DButils.execQuery(`insert into privaterecipes (title, readyInMinutes, image, vegan, vegetarian, glutenFree, ingredients, instructions, servings, user_id)
    values ('${Recipe.title}', '${Recipe.readyInMinutes}', '${Recipe.image}', '${Recipe.vegan}', '${Recipe.vegetarian}', '${Recipe.glutenFree}', '${ingredients_as_JSON}', '${instructions_as_JSON}', '${Recipe.servings}', '${user_id}')`)
}

async function getPreviewPrivateRecipe(user_id){
    const private_recipe = await DButils.execQuery(`select id, title, readyInMinutes, image, vegan, vegetarian, glutenFree from privaterecipes WHERE user_id='${user_id}'`)
    return private_recipe;
}

async function checkIsWatchedRecipe(user_id, recipe_id){
    let watched_recipes_id = await DButils.execQuery(`select recipe_id from watchedrecipes where user_id='${user_id}' and recipe_id='${recipe_id}'`)
    if (watched_recipes_id.length > 0){
        return true;
    }
    return false;
}

async function checkIsFavoriteRecipe(user_id, recipe_id){
    let favorite_recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}' and recipe_id='${recipe_id}'`)
    if (favorite_recipes_id.length > 0){
        return true;
    }
    return false;
}

async function getLastWatchedRecipes(user_id, number){
    const recipes_id = await DButils.execQuery(`select recipe_id from watchedrecipes where user_id='${user_id}' order by watched_at desc limit ${number}`);
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.markAsWatched = markAsWatched;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
exports.createPrivateRecipes = createPrivateRecipes;
exports.getPreviewPrivateRecipe = getPreviewPrivateRecipe;
exports.checkIsWatchedRecipe = checkIsWatchedRecipe;
exports.checkIsFavoriteRecipe = checkIsFavoriteRecipe;
exports.getLastWatchedRecipes = getLastWatchedRecipes;