//  Library
import jsYaml from 'https://cdn.skypack.dev/js-yaml'

//  ============
//  DOM ELEMENTS
//  ============

//  FORM
//  ====

/** @type HTMLFormElement */
const formElement = document.getElementById('form')
/** @type HTMLInputElement */
const userInput = document.getElementById('user')
/** @type HTMLInputElement */
const repoInput = document.getElementById('repo')
/** @type HTMLParagraphElement */
const formError = document.getElementById('error')

//  LABELS
//  ======

/** @type HTMLDivElement */
const labelNames = document.getElementById('label-names')
/** @type HTMLDivElement */
const labelConfigs = document.getElementById('label-configs')

//  COPY
//  ====

/** @type HTMLButtonElement */
const copyYAMLButton = document.getElementById('copy-yaml')
/** @type HTMLButtonElement */
const copyJSONButton = document.getElementById('copy-json')


//  =======
//  ON LOAD
//  =======

document.addEventListener('DOMContentLoaded', async () => {
  const data = await fetch('./data.json').then((res) => res.json())
  labels = formatLabels(data)
  updateLabelsList()
})

//  ====
//  FORM
//  ====

/** Shows error on the form-input */
function showFormError(msg) {
  formError.innerText = msg
  formError.style.transform = msg
    ? 'translateY(0)'
    : 'translateY(-50%)'
}

/** Handle form submit error */
async function handleSubmit(event) {
  event.preventDefault()
  if (!userInput.value || !repoInput.value) {
    showFormError('Please provide the username and repository information')
    return
  }
  showFormError('')
  const data = await fetch(
    `https://api.github.com/repos/${userInput.value}/${repoInput.value}/labels`
  ).then((res) => res.json())
  labels = formatLabels(data)
  updateLabelsList()
}

formElement.addEventListener('submit', handleSubmit)
formElement.addEventListener('reset', () => showFormError(''))

//  ===========
// LABELS STATE
//  ===========

let labels = []

/** Format incoming label data */
function formatLabels(data) {
  return data.map(({ name, color, description }) => ({
    name,
    color: `#${color}`,
    description
  }))
}

/** Update Labels List Element */
function updateLabelsList() {
  for (const label in labels) {

    const labelItem = document.createElement('div')
    labelItem.innerHTML = `
    <div class='label-name-container' style='--clr: ${labels[label].color};'>
    <div class='label-name'>
    ${labels[label].name}
    </div>
    </div>
    `
    labelNames.appendChild(labelItem)

    const labelConfig = document.createElement('div')
    labelConfig.innerHTML = `
      <div class='label-config-container'>
        <pre>${jsYaml.dump([labels[label]])}</pre>
      </div>
    `
    labelConfig.classList.add('label-config')
    labelConfigs.appendChild(labelConfig)

  }
}

// ====
// COPY
// ====

/** onCopy Button Click Handler */
function onCopy(type) {
  const text = type === 'yaml'
    ? jsYaml.dump(labels)
    : JSON.stringify(labels, null, 2)
  navigator.clipboard.writeText(text)
}

copyYAMLButton.addEventListener('click', () => onCopy('yaml'))
copyJSONButton.addEventListener('click', () => onCopy('json'))