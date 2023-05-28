const axios = require("axios");
const { response } = require("express");
const api_domain = "https://api.spoonacular.com/recipes";



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



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}
//get random recipes from spooncolar api
async function getRandomRecipes(){
    const response = await axios.get(`${api_domain}/random`, {
        params: {
            limitLicense: true,
            number: 5,
            apiKey: process.env.spooncular_apiKey
        }
    }); 
    return response;
}

//extract the details from list of recipes
function extractRecipesDetails(recipes_info){
    return recipes_info.map((recipe_info) => {
        let data = recipe_info;
        if (recipe_info.data){
            data = recipe_info.data;
        }
        let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = data;

        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,      
        }
    })
}

//get random recipes and filter them that they have at least image and instruction
async function getRandomThreeRecipes(){
    let random_recipes = await getRandomRecipes();
    let filter_random_recipes = random_recipes.data.recipes.filter((random) => (random.instructions != "") && (random.image && random.image != ""));
    if (filter_random_recipes.length < 3) {
        return getRandomThreeRecipes();
    }
    return extractRecipesDetails([filter_random_recipes[0], filter_random_recipes[1], filter_random_recipes[2]]);
}


async function getFullRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,analyzedInstructions,extendedIngredients,servings} = recipe_info.data;
    let ingredients_dict = [];
    extendedIngredients.map((element) => ingredients_dict.push({
        name: element.name,
        amount: element.amount,
    }))
   
        return {
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            extendedIngredients: ingredients_dict,
            analyzedInstructions: analyzedInstructions,  
            servings: servings,
       
        } 
}

// get recipe details from spooncular API
async function getFilteredSearchRecipes(query, number, cuisine, diet, intolerance,sort){
    if(number === undefined){
        number=5;
    }
    let searchRes = await getRecipesFromSearch(query, number, cuisine, diet, intolerance,sort) ;
    let filterdSearchRes = searchRes.results.filter((random)=>(random.analyzedInstructions.length != 0))
    return extractRecipesDetails(filterdSearchRes);
}

/**get the recipes from the API spooncular
 number: if not choosen send default 5 
 query: the recipe name**/
async function getRecipesFromSearch(query, number, cuisine, diet, intolerance,sort) { 
    let search_url= `${api_domain}/complexSearch/?query=${query}`
    if(cuisine !== undefined){
        search_url = search_url + `&cuisine=${cuisine}`
    }
    if(diet !== undefined){
        search_url = search_url + `&diet=${diet}`
    }
    if(intolerance !== undefined){
        search_url = search_url + `&intolerance=${intolerance}`
    }
    if(sort !== undefined){
        search_url = search_url + `&sort=${sort}`
    }
    search_url = search_url + `&instructionsRequired=true&addRecipeInformation=true` 
    search_url = search_url + `&number=${number}`
    console.log(search_url);
    const response = await axios.get(search_url,{
        
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response.data;

}

// https://api.spoonacular.com/recipes/complexSearch?query=pasta&maxFat=25&number=2


exports.getRecipeDetails = getRecipeDetails;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.getFullRecipeDetails = getFullRecipeDetails;
exports.getFilteredSearchRecipes =getFilteredSearchRecipes;



