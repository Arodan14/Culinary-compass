# Culinary Compass

Culinary Compass is a multi-page recipe discovery web app built with HTML, CSS, and vanilla JavaScript. It uses the Edamam Recipe API for recipe data, Firebase Authentication for login and registration, Firestore for user-saved recipes, and browser storage for theme preference.

## Features

- Search recipes by ingredient from the home page hero section
- Browse recipes with filters for time, calories, ingredients, health labels, cuisine, dish type, and meal type
- View a dedicated recipe details page with ingredients, nutrition summary, and related metadata
- Create an account and sign in with Firebase Authentication
- Save recipes to Firestore so they stay tied to the signed-in user across sessions
- Toggle between light and dark themes

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript with ES modules
- Firebase Authentication
- Cloud Firestore
- Edamam Recipe API

## Project Structure

```text
Culinary_Compass/
|-- index.html
|-- recipes.html
|-- detail.html
|-- saved-recipes.html
|-- login.html
|-- register.html
|-- assets/
|   |-- css/
|   |   |-- login.css
|   |   |-- style.css
|   |   `-- variables_palette.css
|   |-- images/
|   `-- js/
|       |-- api.js
|       |-- auth-page.js
|       |-- config.example.js
|       |-- detail.js
|       |-- firebase.js
|       |-- global.js
|       |-- home.js
|       |-- login.js
|       |-- recipes.js
|       |-- register.js
|       |-- saved_recipes.js
|       `-- theme.js
|-- README.md
`-- style-guide.md
```

## How It Works

### Main pages

- `index.html`: landing page, ingredient search, meal tabs, and featured recipe sliders
- `recipes.html`: recipe listing page with filters and infinite scrolling
- `detail.html`: recipe detail page for a selected recipe
- `saved-recipes.html`: Firestore-backed saved recipe cards for the logged-in user
- `login.html` and `register.html`: Firebase Authentication screens

### Data flow

- `assets/js/api.js` builds Edamam API requests and fetches recipe data
- `assets/js/global.js` contains shared UI helpers, header auth state, and save/remove recipe logic
- `assets/js/firebase.js` initializes Firebase Auth and Firestore
- `assets/js/auth-page.js` handles shared login and registration form behavior
- `assets/js/saved_recipes.js` renders the logged-in user's saved recipes from Firestore-backed client state

## Setup

Because this project uses ES modules, run it through a local static server instead of opening the HTML files directly in the browser.

### 1. Edamam config

Create your local API config file:

1. Copy `assets/js/config.example.js`
2. Rename the copy to `assets/js/config.local.js`
3. Replace the placeholder values with your Edamam credentials

Example:

```js
"use strict";

export const EDAMAM_APP_ID = "your_edamam_app_id";
export const EDAMAM_API_KEY = "your_edamam_api_key";
```

### 2. Firebase setup

1. Create or open your Firebase project
2. Add a Web App in Firebase
3. Enable `Authentication > Sign-in method > Email/Password`
4. Create a Firestore database
5. Replace the Firebase configuration in `assets/js/firebase.js` with your own project values

Example placeholder configuration:

```js
const firebaseConfig = {
  apiKey: "your_firebase_api_key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_app_id"
};
```

### 3. Firestore rules

Use rules like this so each user can read and write only their own profile and saved recipes:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /savedRecipes/{recipeId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 4. Run locally

#### Option 1: VS Code Live Server

1. Install the Live Server extension in VS Code
2. Open the project folder
3. Right-click `index.html`
4. Choose `Open with Live Server`

#### Option 2: Python static server

Run this from the project root:

```bash
python -m http.server 5500
```

Then open `http://localhost:5500`.

## Configuration Notes

- `assets/js/config.example.js` is the tracked template
- `assets/js/config.local.js` contains your real Edamam credentials locally
- `assets/js/config.local.js` is ignored by Git
- `assets/js/firebase.js` should be updated with your own Firebase web app configuration

## Known Limitations

- The Edamam key is kept out of Git, but still exposed client-side at runtime in a browser-only architecture
- Firebase web config may be visible client-side, so Firestore rules must stay strict
- Some page markup is still duplicated across HTML files
- No automated tests are included yet

## Suggested Next Refactors

- Add a logout button
- Move Edamam requests behind a backend or serverless function
- Reduce duplicated header/footer markup across pages
- Add better form validation and friendlier auth error messages

## Credits

- Recipe data: [Edamam](https://www.edamam.com/)
- Authentication and database: [Firebase](https://firebase.google.com/)
