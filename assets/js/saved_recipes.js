"use strict";

import { createRecipeCard } from "./global.js";

const $savedRecipesContainer = document.querySelector("[data-saved-recipe-container]");

if ($savedRecipesContainer) {
    renderSavedRecipes(window.savedRecipesState);
    document.addEventListener("savedrecipeschange", event => renderSavedRecipes(event.detail));
}

function renderSavedRecipes(state = { ready: false, signedIn: false, recipes: [] }) {
    $savedRecipesContainer.innerHTML = `<h2 class="headline-small section-title">Saved Recipes</h2>`;

    if (!state.ready) {
        $savedRecipesContainer.innerHTML += `<p class="body-large saved-empty" data-saved-empty="true">Loading your saved recipes...</p>`;
        return;
    }

    if (!state.signedIn) {
        $savedRecipesContainer.innerHTML += `<p class="body-large saved-empty" data-saved-empty="true">Sign in to view your saved recipes across sessions.</p>`;
        return;
    }

    if (!state.recipes.length) {
        $savedRecipesContainer.innerHTML += `<p class="body-large saved-empty" data-saved-empty="true">You don't have any saved recipes yet</p>`;
        return;
    }

    const $gridList = document.createElement("div");
    $gridList.classList.add("grid-list", "recipe-grid-list", "saved-recipes-grid");

    state.recipes.forEach((savedRecipe, index) => {
        const recipe = savedRecipe.recipe;

        if (!recipe?.uri) return;

        $gridList.appendChild(
            createRecipeCard({
                image: recipe.image,
                title: recipe.label,
                cookingTime: recipe.totalTime,
                recipeId: savedRecipe.recipeId,
                index,
                compact: true
            })
        );
    });

    $savedRecipesContainer.appendChild($gridList);
}
