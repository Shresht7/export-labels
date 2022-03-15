//  Library
import jsYaml from 'https://cdn.skypack.dev/js-yaml';

//  =======
//  ON LOAD
//  =======

document.addEventListener("DOMContentLoaded", async () => {
  labels = await fetch("./data.json").then((res) => res.json());
  labels = labels.map(({ name, color, description }) => ({
    name,
    color: `#${color}`,
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
    color: `#${color}`,
    description
  }));
  updateLabelsList();
}

formElement.addEventListener("submit", handleSubmit);

//  ===========
// LABELS STATE
//  ===========

/** @type HTMLUListElement */
const labelNames = document.getElementById("label-names");
const labelConfigs = document.getElementById("label-configs");

let labels = [];

function updateLabelsList() {
  for (const label in labels) {
    const labelItem = document.createElement("div");
    const labelConfig = document.createElement('div');
    labelItem.innerHTML = `
    <div class='label-name-container' style='--clr: ${labels[label].color};'>
      <div class='label-name'>
        ${labels[label].name}
      </div>
    </div>
    `
    labelConfig.innerHTML = `
      <div class='label-config-container'>
        <pre>${jsYaml.dump([labels[label]])}</pre>
      </div>
    `
    labelConfig.classList.add('label-config')
    labelNames.appendChild(labelItem)
    labelConfigs.appendChild(labelConfig)
  }
}

// ====
// COPY
// ====

/** HTMLButtonElement */
const copyYAMLButton = document.getElementById("copy-yaml");
const copyJSONButton = document.getElementById("copy-json");

function onCopy(type) {
  const text = type === 'yaml'
    ? jsYaml.dump(labels)
    : JSON.stringify(labels, null, 2)
  navigator.clipboard.writeText(text)
}

copyYAMLButton.addEventListener("click", () => onCopy('yaml'));
copyJSONButton.addEventListener("click", () => onCopy('json'));