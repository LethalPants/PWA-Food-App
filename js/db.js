db.enablePersistence().catch(err => {
  if (err.code === "failed-precondition") {
    console.log("Persistence failed");
  } else if (err.code === "unimplemented") {
    console.log("No browser support");
  }
});

db.collection("recipes").onSnapshot(snapshot => {
  //console.log(snapshot.docChanges());
  snapshot.docChanges().forEach(change => {
    if (change.type === "added") {
      // add the document data to the web page
      renderRecipe(change.doc.data(), change.doc.id);
    }
    if (change.type === "removed") {
      // remove the document data from the web page
      removeRecipe(change.doc.id);
    }
  });
});

const form = document.querySelector("form");
form.addEventListener("submit", evt => {
  evt.preventDefault();
  const recipe = {
    title: form.title.value,
    ingredients: form.ingredients.value
  };
  if (!!recipe.title || !!recipe.ingredients) {
    db.collection("recipes")
      .add(recipe)
      .catch(err => console.log(err));
    form.title.value = "";
    form.ingredients.value = "";
  }
});

const recipeContainer = document.querySelector(".recipes");
recipeContainer.addEventListener("click", event => {
  if (event.target.tagName === "I") {
    const id = event.target.getAttribute("data-id");
    db.collection("recipes")
      .doc(id)
      .delete();
  }
});
