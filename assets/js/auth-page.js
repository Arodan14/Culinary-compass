"use strict";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { auth, db } from "./firebase.js";

const $form = document.querySelector("[data-auth-form]");
const $submitButton = document.querySelector("[data-auth-submit]");
const $statusMessage = document.querySelector("[data-auth-message]");

const getDisplayNameFromEmail = email => {
  const [namePart = "Chef"] = email.split("@");
  return namePart.replace(/[._-]+/g, " ").trim() || "Chef";
};

if ($form && $submitButton) {
  const mode = $form.dataset.authMode;

  $form.addEventListener("submit", async event => {
    event.preventDefault();

    const email = $form.querySelector("#email")?.value.trim();
    const password = $form.querySelector("#password")?.value;

    if (!email || !password) {
      renderMessage("Please enter both email and password.", true);
      return;
    }

    $submitButton.disabled = true;
    renderMessage("");

    try {
      if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = getDisplayNameFromEmail(email);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          displayName,
          createdAt: serverTimestamp()
        });

        renderMessage("Account created successfully. Redirecting...");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        renderMessage("Signed in successfully. Redirecting...");
      }

      window.location.href = "./index.html";
    } catch (error) {
      renderMessage(error.message, true);
    } finally {
      $submitButton.disabled = false;
    }
  });
}

function renderMessage(message, isError = false) {
  if (!$statusMessage) return;
  $statusMessage.textContent = message;
  $statusMessage.hidden = !message;
  $statusMessage.classList.toggle("error", isError);
}
