
"use strict";

/**
 * Import
 */

import { fetchData } from "./api.js";
import { $skeletonCard, cardQueries, createRecipeCard } from "./global.js";



/**
 * Home page Search
 */

const $searchField = document.querySelector("[data-search-field]");
const $searchBtn = document.querySelector("[data-search-btn]");


$searchBtn.addEventListener("click", function () {
    if ($searchField.value) window.location = `/recipes.html?q=${$searchField.value}`

});

/**
 * Serch submit when "Enter" key is pressed
*/

$searchField.addEventListener("keydown", e => {
    if(e.key === "Enter") $searchBtn.click();
});

/**
 * Tab panel navigation
 */

const $tabBtns = document.querySelectorAll("[data-tab-btn]");
const $tabPanels = document.querySelectorAll("[data-tab-panel]");

let [$lastActiveTabPanel] = $tabPanels;
let [$lastActiveTabBtn] = $tabBtns;

addEventOnElements($tabBtns, "click", function () {
    $lastActiveTabPanel.setAttribute("hidden", "");
    $lastActiveTabBtn.setAttribute("aria-selected", false);
    $lastActiveTabBtn.setAttribute("tabindex", -1);

    const $currentTabPanel = document.querySelector(`#${this.getAttribute("aria-controls")}`);
    $currentTabPanel.removeAttribute("hidden");
    this.setAttribute("aria-selected", true);
    this.setAttribute("tabindex", 0);

    $lastActiveTabPanel = $currentTabPanel;
    $lastActiveTabBtn = this;

    addTabContent(this, $currentTabPanel)
});

/**
 * Navigate tab with arrow key
 */

addEventOnElements($tabBtns, "keydown", function(e){
    const $nextElement = this.nextElementsibling;
    const $previousElement = this.previoustElementsibling;

    if(e.key === "ArrowRight" && $nextElement) {
        this.setAttribute("tabindex", -1);
        $nextElement.setAttribute("tabindex", 0);
        $nextElement.focus();
    }
    else if(e.key === "ArrowLeft" && $previousElement){
        this.setAttribute("tabindex", -1);
        $previousElement.setAttribute("tabinedx", 0);
        $previousElement.focus();
    }
    else if(e.key === "Tab"){
        this.setAttribute("tabindex", -1);
        $lastActiveTabBtn.setAttribute("tabindex", 0);
    }
});


/**
 * Fetch data for tab content
 */

const addTabContent = ($currentTabBtn, $currentTabPanel) => {

    const $gridList = document.createElement("div");
    $gridList.classList.add("grid-list", "recipe-grid-list");

    $currentTabPanel.innerHTML = `
                                    <div class="grid-list">
                                        ${$skeletonCard.repeat(12)}
                                    </div>
                                 `;
            
    fetchData(
               [['mealType', $currentTabBtn.textContent.trim().toLowerCase()], ...cardQueries], function (data) {
                                                                                                                    $currentTabPanel.innerHTML = "";

                                                                                                                    for (let i = 0; i < 12; i++)
                                                                                                                        {
                                                                                                                            const {
                                                                                                                                    recipe: {
                                                                                                                                             image,
                                                                                                                                             label: title,
                                                                                                                                             totalTime: cookingTime,
                                                                                                                                             uri
                                                                                                                                            }
                                                                                                                                  } = data.hits[i];

                                                                                                                            const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
                                                                                                                            $gridList.appendChild(
                                                                                                                                createRecipeCard({
                                                                                                                                    image,
                                                                                                                                    title,
                                                                                                                                    cookingTime,
                                                                                                                                    recipeId,
                                                                                                                                    index: i,
                                                                                                                                    compact: true
                                                                                                                                })
                                                                                                                            );
                                                                                                                        }
                                                                                                                    
                                                                                                                    $currentTabPanel.appendChild($gridList);
                                                                                                                    
                                                                                                                    $currentTabPanel.innerHTML += `
                                                                                                                                                 <a href="./recipes.html?mealType=${$currentTabBtn.textContent.trim().toLowerCase()}" class="btn btn-secondary label-large has-state">Show more</a>
                                                                                                                                                `;   
                                                                                                                }
             );
}

addTabContent($lastActiveTabBtn, $lastActiveTabPanel)


/**
 * Fetch data for slider card
 */

let cuisineType = ["Mediterranean", "French", "Asian"];

const $sliderSections = document.querySelectorAll("[data-slider-section]");

for(const [index, $sliderSection] of $sliderSections.entries()) {
                                                                 $sliderSection.innerHTML = `
                                                                                              <div class="container slider-showcase">

                                                                                                <h2 class="section-title headline-small" id="slider-label-1"> Latest ${cuisineType[index]} Recipes </h2>

                                                                                                <div class="slider">
                                                                                                    <ul class="slider-wrapper" data-slider-wrapper>
                                                                                                    ${`<li class="slider-item">${$skeletonCard}</li>`.repeat(10)}
                                                                                                    </ul>
                                                                                                </div>

                                                                                              </div>
                                                                                            `;

                                                                 const $sliderWrapper = $sliderSection.querySelector("[data-slider-wrapper]");

                                                                 fetchData([...cardQueries, ["cuisineType", cuisineType[index]]], function(data){
                                                                                                                                                 $sliderWrapper.innerHTML = "";

                                                                                                                                                 data.hits.map(item => {
                                                                                                                                                                         const {
                                                                                                                                                                                recipe: {
                                                                                                                                                                                        image,
                                                                                                                                                                                        label: title,
                                                                                                                                                                                        totalTime: cookingTime,
                                                                                                                                                                                        uri
                                                                                                                                                                                        }
                                                                                                                                                                                } = item;

                                                                                                                                                                         const recipeId = uri.slice(uri.lastIndexOf("_") + 1);
                                                                                                                                                                         const $sliderItem = document.createElement("li");
                                                                                                                                                                         $sliderItem.classList.add("slider-item");
                                                                                                                                                                         $sliderItem.appendChild(
                                                                                                                                                                            createRecipeCard({
                                                                                                                                                                                image,
                                                                                                                                                                                title,
                                                                                                                                                                                cookingTime,
                                                                                                                                                                                recipeId
                                                                                                                                                                            })
                                                                                                                                                                         );
                                                                                                                                                                        
                                                                                                                                                                        $sliderWrapper.appendChild($sliderItem);
                                                                                                                                                                       }  
                                                                                                                                                              );

                                                                                                                                                 $sliderWrapper.innerHTML += `
                                                                                                                                                                                <li class="slider-item" data-slider-item>
                                                                                                                                                                                    <a href="./recipes.html?cuisineType=${cuisineType[index].toLowerCase()}" class="load-more-card has-state">
                                                                                                                                                                                        <span class="label-large">Show more</span>
                                                                                                                                                                                        <span class="material-symbols-outlined" aria-hidden="true">navigate_next</span>
                                                                                                                                                                                    </a>
                                                                                                                                                                                </li>
                                                                                                                                                                             `;
                                                                                                                                                }
                                                                          );
                                                               }

                                
