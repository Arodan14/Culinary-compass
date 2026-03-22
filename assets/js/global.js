
"use strict";

import { fetchRecipeById } from "./api.js";
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    serverTimestamp,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getTime } from "./module.js";

/**
 * Add event on multiple elements
 * @param {NodeList} $elements NodeList
 * @param {String} eventType Event type string
 * @param {Function} callback Callback function
 */

window.addEventOnElements = ($elements, eventType, callback) => {
    for (const $element of $elements) {
        $element.addEventListener(eventType, callback);
    }   
}


export const cardQueries = [
                            ["field", "uri"],
                            ["field", "label"],
                            ["field", "image"],
                            ["field", "totalTime"], 
                           ];

/**
 * Skeleton card
 */

export const $skeletonCard = `
                                 <div class="card skeleton-card">
                                    <div class="skeleton card-banner">

                                    </div>
                                    <div class="card-body">
                                        <div class="skeleton card-title">
                                            <div class="skeleton card-text"></div>
                                        </div>
                                    </div>
                                </div>
                             `;


let currentUser = null;
let authStateResolved = false;
const savedRecipeMap = new Map();

window.savedRecipesState = {
    ready: false,
    signedIn: false,
    recipes: []
};

export const isRecipeSaved = recipeId => savedRecipeMap.has(recipeId);

export const createRecipeCard = ({ image, title, cookingTime, recipeId, index = 0, compact = false }) => {
    const $card = document.createElement("div");
    $card.classList.add("card", "recipe-card");

    if (compact) {
        $card.classList.add("recipe-card-compact");
    }

    $card.dataset.recipeCard = "true";
    $card.dataset.recipeId = recipeId;
    $card.style.animationDelay = `${100 * index}ms`;

    $card.innerHTML = `
        <figure class="card-media img-holder">
            <img src="${image}" alt="${title}"
            width="195" height="195" loading="lazy" class="img-cover"
            >
        </figure>

        <div class="card-body">
            <h3 class="title-small">
                <a href="./detail.html?recipe=${recipeId}" class="card-link">${title ?? "Untitled"}</a>
            </h3>

            <div class="meta-wrapper">
                <div class="meta-item">
                    <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                    <span class="label-medium">${getTime(cookingTime).time || "<1"} ${getTime(cookingTime).timeUnit}</span>
                </div>

                <button class="icon-btn has-state ${isRecipeSaved(recipeId) ? "saved" : "removed"}" aria-label="${isRecipeSaved(recipeId) ? "Remove from saved recipes" : "Add to saved recipes"}" data-save-button data-recipe-id="${recipeId}" onclick="saveRecipe(this, '${recipeId}')">
                    <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                    <span class="material-symbols-outlined bookmark" aria-hidden="true">bookmark</span>
                </button>
            </div>
        </div>
    `;

    return $card;
};

window.saveRecipe = async function(element, recipeId) {
    if (!authStateResolved) {
        showNotification("Loading your account, please try again");
        return;
    }

    if (!currentUser) {
        showNotification("Sign in to save recipes to your account");
        window.location.href = "/login.html";
        return;
    }

    element.disabled = true;

    try {
        if (isRecipeSaved(recipeId)) {
            await deleteDoc(doc(db, "users", currentUser.uid, "savedRecipes", recipeId));
            savedRecipeMap.delete(recipeId);
            syncSaveButtons(recipeId, false);
            removeSavedRecipeCard(recipeId);
            emitSavedRecipesState();
            showNotification("Recipe removed from Recipe book");
            return;
        }

        await fetchRecipeById(recipeId, async function (data) {
            const savedRecipeData = {
                recipe: data.recipe,
                savedAt: serverTimestamp()
            };

            await setDoc(doc(db, "users", currentUser.uid, "savedRecipes", recipeId), savedRecipeData);
            savedRecipeMap.set(recipeId, savedRecipeData);
            syncSaveButtons(recipeId, true);
            emitSavedRecipesState();
            showNotification("Recipe added to Recipe book");
        });
    } catch (error) {
        console.error("Could not update saved recipe:", error);
        showNotification("Could not update saved recipes right now");
    } finally {
        element.disabled = false;
    }
}


const $snackbarContainer = document.createElement("div");
$snackbarContainer.classList.add("snackbar-container");
document.body.appendChild($snackbarContainer);

function showNotification(message) {
    const $snackbar = document.createElement("div");
    $snackbar.classList.add("snackbar");
    $snackbar.innerHTML = `<p class="body-medium">${message}</p>`;
    $snackbarContainer.appendChild($snackbar);
    $snackbar.addEventListener("animationend", e => $snackbarContainer.removeChild($snackbar));
}

function syncSaveButtons(recipeId, isSaved) {
    const recipeButtons = document.querySelectorAll(`[data-save-button][data-recipe-id="${recipeId}"]`);

    recipeButtons.forEach($button => {
        $button.classList.toggle("saved", isSaved);
        $button.classList.toggle("removed", !isSaved);
        $button.setAttribute("aria-label", isSaved ? "Remove from saved recipes" : "Add to saved recipes");
    });
}

function removeSavedRecipeCard(recipeId) {
    const $savedRecipesContainer = document.querySelector("[data-saved-recipe-container]");
    if (!$savedRecipesContainer) return;

    const $recipeCard = $savedRecipesContainer.querySelector(`[data-recipe-card][data-recipe-id="${recipeId}"]`);
    $recipeCard?.remove();

    const remainingCards = $savedRecipesContainer.querySelectorAll("[data-recipe-card]");
    let $emptyMessage = $savedRecipesContainer.querySelector("[data-saved-empty]");

    if (!remainingCards.length) {
        if (!$emptyMessage) {
            $emptyMessage = document.createElement("p");
            $emptyMessage.className = "body-large saved-empty";
            $emptyMessage.dataset.savedEmpty = "true";
            $emptyMessage.textContent = "You don't have any saved recipes yet";
            $savedRecipesContainer.appendChild($emptyMessage);
        }
        return;
    }

    $emptyMessage?.remove();
}

function emitSavedRecipesState() {
    const recipes = Array.from(savedRecipeMap.entries()).map(([recipeId, savedRecipe]) => ({
        recipeId,
        ...savedRecipe
    }));

    window.savedRecipesState = {
        ready: true,
        signedIn: Boolean(currentUser),
        recipes
    };

    document.dispatchEvent(new CustomEvent("savedrecipeschange", {
        detail: window.savedRecipesState
    }));
}

function syncAllSaveButtons() {
    const recipeButtons = document.querySelectorAll("[data-save-button][data-recipe-id]");

    recipeButtons.forEach($button => {
        const recipeId = $button.dataset.recipeId;
        syncSaveButtons(recipeId, isRecipeSaved(recipeId));
    });
}

const $authLink = document.querySelector("[data-auth-link]");
const $authLabel = document.querySelector("[data-auth-label]");
const $authIcon = document.querySelector("[data-auth-icon]");

onAuthStateChanged(auth, async user => {
    currentUser = user;
    authStateResolved = true;

    if (!user) {
        savedRecipeMap.clear();
        emitSavedRecipesState();
        syncAllSaveButtons();

        if ($authLink && $authLabel && $authIcon) {
            setHeaderAuthState({
                href: "/login.html",
                icon: "login",
                label: "Login",
                title: "Login"
            });
        }
        return;
    }

    await loadSavedRecipes(user.uid);
    syncAllSaveButtons();

    if ($authLink && $authLabel && $authIcon) {
        const label = await getUserDisplayName(user);

        setHeaderAuthState({
            href: "/saved-recipes.html",
            icon: "account_circle",
            label,
            title: `Signed in as ${label}`
        });
    }
});

async function loadSavedRecipes(userId) {
    savedRecipeMap.clear();

    try {
        const savedRecipesSnapshot = await getDocs(collection(db, "users", userId, "savedRecipes"));

        savedRecipesSnapshot.forEach(savedRecipeDoc => {
            savedRecipeMap.set(savedRecipeDoc.id, savedRecipeDoc.data());
        });
    } catch (error) {
        console.error("Could not load saved recipes:", error);
    }

    emitSavedRecipesState();
}

async function getUserDisplayName(user) {
    try {
        const userSnapshot = await getDoc(doc(db, "users", user.uid));
        const profileData = userSnapshot.exists() ? userSnapshot.data() : null;

        if (profileData?.displayName) {
            return profileData.displayName;
        }

        if (profileData?.email) {
            return formatDisplayName(profileData.email);
        }
    } catch (error) {
        console.error("Could not load user profile for header:", error);
    }

    return formatDisplayName(user.email);
}

function formatDisplayName(email = "") {
    const [namePart = "Chef"] = email.split("@");
    return namePart.replace(/[._-]+/g, " ").trim() || "Chef";
}

function setHeaderAuthState({ href, icon, label, title }) {
    $authLink.setAttribute("href", href);
    $authLink.setAttribute("aria-label", title);
    $authLink.setAttribute("title", title);
    $authIcon.textContent = icon;
    $authLabel.textContent = label;
}
