
"use strict";

/**
 * Import
 */

import { fetchData } from "./api.js";
import { isRecipeSaved } from "./global.js";
import { getTime } from "./module.js";


/**
 * Render data
 */

const $detailContainer = document.querySelector("[data-detail-container]");

ACCESS_POINT += `/${window.location.search.slice(window.location.search.indexOf("=") + 1)}`;



fetchData(null, data => {
   
    console.log(data);
    
    const {
        images : { LARGE, REGULAR, SMALL, THUMBNAIL },
        label: title,
        source: author,
        ingredients = [],
        totalTime : cookingTime = 0,
        calories = 0,
        cuisineType = [],
        dietLabels = [],
        dishType = [],
        yield: servings = 0,
        ingredientLines = [],
        uri,
    } = data.recipe;

    document.title = `${title} - Culinary Compass`;

    const banner = LARGE ?? REGULAR ?? SMALL ?? THUMBNAIL;
    const { url: bannerUrl, width, height } = banner;
    const tags = [...cuisineType, ...dietLabels, ...dishType];

    let tagElements = "";
    let ingredientItems = "";

    const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
    const isSaved = isRecipeSaved(recipeId);

    tags.map(tag => {
        let type = "";

        if (cuisineType.includes(tag)) {
            type = "cuisineType";
        }
        else if (dietLabels.includes(tag)){
            type = "diet";
        }
        else {
            type = "dishType";
        }

        tagElements += `
                        <a href="./recipes.html?${type}=${tag.toLowerCase()}" class="filter-chip label-large has-state">${tag}</a>
                       `;
    });

    ingredientLines.map(ingredient => {
        ingredientItems += `<li class="ingr-item">${ingredient}</li>`;
    });

    $detailContainer.innerHTML = `
                                    <figure class="detail-banne img-holder">
                                    <img src="${bannerUrl}" width="${width}" height="${height}"
                                    alt="${title}" class="img-cover"
                                    >
                                    </figure>

                                    <div class="detail-content">

                                        <div class="title-wrapper">
                                            <h1 class="display-small">${title ?? "Untitled"}</h1>
                                            
                                            <button class="btn btn-secondary has-state has-icon ${isSaved ? "saved" : "removed"}" data-save-button data-recipe-id="${recipeId}" onclick="saveRecipe(this, '${recipeId}')">
                                                <span class="material-symbols-outlined bookmark-add" aria-hidden="true">
                                                    bookmark_add
                                                </span>
                                                <span class="material-symbols-outlined bookmark" aria-hidden="true">
                                                    bookmark
                                                </span>

                                                <span class="label-large save-text">Save</span>
                                                <span class="label-large unsave-text">Unsave</span>
                                            </button>
                                        
                                        </div>

                                        <div class="detail-author label-large">
                                            <span class="span">by</span> ${author}
                                        </div>
                                        
                                        <div class="detail-stats">
                                            
                                            <div class="stats-item">
                                                <span class="display-medium">${ingredients.length}</span>
                                                <span class="label-medium">Ingredients</span>
                                            </div>

                                            <div class="stats-item">
                                                <span class="display-medium">${getTime(cookingTime).time || "??"}</span>
                                                <span class="label-medium">${getTime(cookingTime).timeUnit}</span>
                                            </div>

                                            <div class="stats-item">
                                                <span class="display-medium">${Math.floor(calories)}</span>
                                                <span class="label-medium">calories</span>
                                            </div>

                                        </div>

                                        ${tagElements ? `<div class="tag-list">${tagElements}</div>` : ""}

                                        <h2 class="title-medium ingr-title">Ingredients <span class="label-medium">for ${servings} servings</span></h2>

                                        ${ingredientItems ? `<ul class="body-large ingr-list">${ingredientItems}</ul>` : ""}

                                                                                <div id="video-container">
                                            <!-- YouTube video will be embedded here -->

                                        </div>
                                        
                                        
                        
                                    </div>
                                 `;

                                
    
});

