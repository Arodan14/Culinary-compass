
"use strict";

import { EDAMAM_API_KEY, EDAMAM_APP_ID } from "./config.local.js";

const RECIPES_ACCESS_POINT = "https://api.edamam.com/api/recipes/v2";
window.ACCESS_POINT = RECIPES_ACCESS_POINT;

const TYPE = "public";

/**
 * 
 * @param {Array} queries Query array 
 * @param {Function} successCallback success callback function
 */

export const fetchData = async function (queries, successCallback) {
    const query = queries?.join("&").replace(/,/g, "=").replace(/ /g, "%20").replace(/\+/g, "%2B");
    
    const url = `${ACCESS_POINT}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_API_KEY}&type=${TYPE}${query ? `&${query}` : ""}`

    const response = await fetch(url);

    if (response.ok)
        {
            const data = await response.json();
            await successCallback(data);
        }
}

export const fetchRecipeById = async function (recipeId, successCallback) {
    const url = `${RECIPES_ACCESS_POINT}/${recipeId}?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_API_KEY}&type=${TYPE}`;
    const response = await fetch(url);

    if (response.ok) {
        const data = await response.json();
        await successCallback(data);
    }
}
