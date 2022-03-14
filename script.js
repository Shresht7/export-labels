//  =======
//  ON LOAD
//  =======

document.addEventListener("DOMContentLoaded", async () => {
  labels = await fetch("./data.json").then((res) => res.json());
  labels = labels.map(({ name, color, description }) => ({
    name,
    color,
    description
  }));
  updateLabelsList();
});

//  ====
//  FORM
//  ====

/** @type HTMLFormElement */
const formElement = document.getElementById("form");
/** @type HTMLInputElement */
const userInput = document.getElementById("user");
/** @type HTMLInputElement */
const repoInput = document.getElementById("repo");

async function handleSubmit(event) {
  event.preventDefault();
  labels = await fetch(
    `https://api.github.com/repos/${userInput.value}/${repoInput.value}/labels`
  ).then((res) => res.json());
  labels = labels.map(({ name, color, description }) => ({
    name,
    color,
    description
  }));
  updateLabelsList();
}

formElement.addEventListener("submit", handleSubmit);

//  ===========
// LABELS STATE
//  ===========

/** @type HTMLUListElement */
const labelsList = document.getElementById("labels");

let labels = [];

function updateLabelsList() {
  for (const label of labels) {
    const li = document.createElement("li");
    li.innerText = label.name + ": " + label.description;
    li.style.color = `#${label.color}`;
    labelsList.appendChild(li);
  }
  outputElement.innerText = JSON.stringify(labels, null, 2);
}

// ======
// OUTPUT
// ======

const outputElement = document.getElementById("output-content");

// ======
// EXPORT
// ======

/** HTMLButtonElement */
const exportButton = document.getElementById("export");

function onExport() {
  console.log(labels);
}

exportButton.addEventListener("click", onExport);
