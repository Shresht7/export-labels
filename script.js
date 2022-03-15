//  Library
import jsYaml from 'https://cdn.skypack.dev/js-yaml';

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
  for (const label in labels) {
    const labelItem = document.createElement("div");
    labelItem.innerHTML = `
      <div class='label-name-container'>
          <div class='label-name' style='color: #${labels[label].color};'>
            ${labels[label].name}
          </div>
      </div>
      <div class='label-config'>
        <pre>${jsYaml.dump([labels[label]]).trim()}</pre>
      </div>
    `
    labelItem.classList.add('label-item');
    labelsList.appendChild(labelItem);
  }
}

// ====
// COPY
// ====

/** HTMLButtonElement */
const copyButton = document.getElementById("copy-to-clipboard");

function onCopy() {
  const text = jsYaml.dump(labels)
  navigator.clipboard.writeText(text)
}

copyButton.addEventListener("click", onCopy);