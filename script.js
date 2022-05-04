//  Library
import jsYaml from 'https://cdn.skypack.dev/js-yaml'
import color from 'https://cdn.skypack.dev/color'

//  ============
//  DOM ELEMENTS
//  ============

//  FORM
//  ----

/** @type HTMLFormElement */
const formElement = document.getElementById('form')
/** @type HTMLInputElement */
const userInput = document.getElementById('user')
/** @type HTMLInputElement */
const repoInput = document.getElementById('repo')
/** @type HTMLParagraphElement */
const formError = document.getElementById('form-error')

//  LABELS
//  ------

/** @type HTMLSectionElement */
const labelSection = document.getElementById('labels')
/** @type HTMLDivElement */
const labelNames = document.getElementById('label-names')
/** @type HTMLDivElement */
const labelConfigs = document.getElementById('label-configs')

//  COPY
//  ----

/** @type HTMLButtonElement */
const copyYAMLButton = document.getElementById('copy-yaml')
/** @type HTMLButtonElement */
const copyJSONButton = document.getElementById('copy-json')

//  MISCELLANEOUS
//  -------------

/** @type HTMLSectionElement */
const loadingSection = document.querySelector('.loading')

//  ================
//  HELPER FUNCTIONS
//  ================

/** Shows/hides the loading spinner */
async function showLoading(state) {
  if (state) {
    labelSection.style.display = 'none'
    loadingSection.style.display = 'grid'
  } else {
    labelSection.style.display = 'grid'
    loadingSection.style.display = 'none'
  }
}

/** Fetch and format label data */
async function fetchLabels(src) {
  const labels = await fetch(src)
    .then(res => res.json())
    .then(data => formatLabels(data))
    .catch(err => console.error(err))
  return labels
}

//  =======
//  ON LOAD
//  =======

document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true)

  labels = await fetchLabels('./data.json')
  updateLabelsList()

  showLoading(false)
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
  showLoading(true)

  if (!userInput.value || !repoInput.value) {
    showFormError('Please provide the username and repository information')
    return
  }
  showFormError('')

  labels = await fetchLabels(`https://api.github.com/repos/${userInput.value}/${repoInput.value}/labels`)
  updateLabelsList()

  showLoading(false)
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
    color: color.startsWith('#') ? color : `#${color}`,
    description
  }))
}

/** Update Labels List Element */
function updateLabelsList() {

  clearLabelsList()

  for (const label in labels) {
    const labelItem = document.createElement('div')

    const [r, g, b] = color(labels[label].color).rgb().array()
    const [h, s, l] = color(labels[label].color).hsl().array()

    labelItem.innerHTML = `
    <div class='label-name-container'>
    <div class='label-name' style='--label-r: ${r}; --label-g: ${g}; --label-b: ${b}; --label-h: ${h}; --label-s: ${s}; --label-l: ${l};'>
    ${labels[label].name}
    </div>
    </div>
    `
    labelNames.appendChild(labelItem)

    const labelConfig = document.createElement('div')
    let text = `
      <div class='label-config-container'>
        <pre>${jsYaml.dump([labels[label]])}</pre>
      </div>
    `
    text = text.replace(/(\w+):(\s*.+)/gim, '<span class="yaml-key">$1</span>:<span class="yaml-value">$2</span>')
    labelConfig.innerHTML = text
    labelConfig.classList.add('label-config')
    labelConfigs.appendChild(labelConfig)

  }
}

/** Clears out the labels list */
function clearLabelsList() {
  labelNames.innerHTML = ''
  labelConfigs.innerHTML = ''
}


// ====
// COPY
// ====

/** onCopy Button Click Handler */
function onCopy(e, type) {
  const text = type === 'yaml'
    ? jsYaml.dump(labels)
    : JSON.stringify(labels, null, 2)

  navigator.clipboard.writeText(text)

  document.getElementById('copy-to-clipboard').innerText = `Copied as ${type.toUpperCase()} ✅`
}

copyYAMLButton.addEventListener('click', (e) => onCopy(e, 'yaml'))
copyJSONButton.addEventListener('click', (e) => onCopy(e, 'json'))

//  ============
//  THEME TOGGLE
//  ============

/** @type HTMLButtonElement */
const toggleThemeButton = document.getElementById('theme-toggle')

//  Toggle Theme Button Click Handler
toggleThemeButton.addEventListener('click', () => {

  const theme = toggleThemeButton.getAttribute('data-theme')

  if (theme === 'light') {

    toggleThemeButton.setAttribute('data-theme', 'dark')
    toggleThemeButton.innerText = '☀'

    const labels = document.querySelectorAll('.label-name')
    for (const label of labels) { label.classList.add('dark') }

    document.body.classList.add('dark')

  } else {

    toggleThemeButton.setAttribute('data-theme', 'light')
    toggleThemeButton.innerText = '🌙'

    const labels = document.querySelectorAll('.label-name')
    for (const label of labels) { label.classList.remove('dark') }

    document.body.classList.remove('dark')

  }

})