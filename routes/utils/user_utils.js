const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getFamilyRecipes(user_id){
    const recipes_details = await DButils.execQuery(`select recipe_id as id, title,image,readyInMinutes, vegan, vegetarian, glutenFree, owner, customary, ingredients, instructions, servings  from recipes where user_id='${user_id}' and type like 'family%'`);
    return recipes_details;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getFamilyRecipes = getFamilyRecipes;
