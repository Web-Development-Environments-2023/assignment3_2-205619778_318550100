const axios = require("axios");
const { response } = require("express");
const api_domain = "https://api.spoonacular.com/recipes";
const user_utils = require("./user_utils");


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

//get preview recipe details by recipe_id
async function getRecipePreviewDetails(recipe_id, user_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let {id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree} = recipe_info.data;
    let isWatched = await user_utils.checkIsWatchedRecipe(user_id, id);
    let isFavorite = await user_utils.checkIsFavoriteRecipe(user_id, id);
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        isWatched: isWatched,
        isFavorite: isFavorite,
    }
}

//get recipe details from list of recipes
async function getRecipesPreviewDetails(recipes_info, user_id){
    return await Promise.all(recipes_info.map(async (recipe_info) => {
        let data = recipe_info;
        if (recipe_info.data){
            data = recipe_info.data;
        }
        let {id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree} = data;
        let isWatched = await user_utils.checkIsWatchedRecipe(user_id, id);
        let isFavorite = await user_utils.checkIsFavoriteRecipe(user_id, id);
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,      
            isWatched: isWatched,
            isFavorite: isFavorite,
        }
    }))
}

//get full recipe details by recipe_id
async function getRecipeFullDetails(recipe_id, user_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let {id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,analyzedInstructions,extendedIngredients,servings} = recipe_info.data;
    let isWatched = await user_utils.checkIsWatchedRecipe(user_id, id);
    let isFavorite = await user_utils.checkIsFavoriteRecipe(user_id, id);
    let ingredients_dict = [];
    await Promise.all(extendedIngredients.map(async (element) => ingredients_dict.push({
        name: element.name,
        amount: element.amount,
    })))
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            ingredients: ingredients_dict,
            instructions: analyzedInstructions,  
            servings: servings,
            isWatched: isWatched,
            isFavorite: isFavorite,
        } 
}

//get preview details of 3 random recipes
async function getThreeRandomRecipes(user_id){
    let random_recipes = await getRandomRecipes(5);
    //filter them that they have at least image and instruction
    let filter_random_recipes = random_recipes.data.recipes.filter((random) => (random.instructions != "") && (random.image && random.image != ""));
    if (filter_random_recipes.length < 3) {
        return getThreeRandomRecipes(user_id);
    }
    return getRecipesPreviewDetails([filter_random_recipes[0], filter_random_recipes[1], filter_random_recipes[2]], user_id);
}
//get random recipes from spooncolar api
async function getRandomRecipes(number){
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            limitLicense: true,
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    }); 
    return response;
}

// get recipes preview from the spooncular API query search
// default nuber of recipes is 5
async function getSearchRecipes(query, number, cuisine, diet, intolerance){
    if(number === undefined){
        number = 5;
    }
    let search_result = await getRecipesFromSearchAPI(query, number, cuisine, diet, intolerance) ;
    return getRecipesPreviewDetails(search_result.results);
}

// get the recipes data from the spooncular API query search
 async function getRecipesFromSearchAPI(searchQuery, searchNumber, searchCuisine, searchDiet, searchIntolerance) { 
    const response = await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: searchQuery,
            number: searchNumber,
            cuisine: searchCuisine,
            diet: searchDiet,
            intolerances: searchIntolerance,
            instructionsRequired: true,
            addRecipeInformation: true,
            apiKey: process.env.spooncular_apiKey,
        },
    });
    return response.data;
}



exports.getRecipePreviewDetails = getRecipePreviewDetails;
exports.getThreeRandomRecipes = getThreeRandomRecipes;
exports.getRecipeFullDetails = getRecipeFullDetails;
exports.getSearchRecipes =getSearchRecipes;
exports.getRecipesPreviewDetails=getRecipesPreviewDetails;



