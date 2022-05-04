//  Library
import jsYaml from 'https://cdn.skypack.dev/js-yaml'
import color from 'https://cdn.skypack.dev/color'

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

/** @type HTMLFormElement */
const formElement = document.getElementById('form')
/** @type HTMLInputElement */
const userInput = document.getElementById('user')
/** @type HTMLInputElement */
const repoInput = document.getElementById('repo')
/** @type HTMLParagraphElement */
const formError = document.getElementById('form-error')

/** Shows error on the form-input */
function showFormError(msg) {
  formError.innerText = msg
  formError.style.transform = msg
    ? 'translateY(0)'
    : 'translateY(-50%)'
}

/** Handle form submit error */
async function handleSubmit(event) {

  event.preventDefault()  //  Prevent default form submit behaviour (e.g. refreshing the page)
  showLoading(true) //  Show the loading spinner

  //  Validate input
  if (!userInput.value || !repoInput.value) {
    showFormError('Please provide the username and repository information')
    return
  }
  showFormError('')

  //  Fetch and update labels list
  labels = await fetchLabels(`https://api.github.com/repos/${userInput.value}/${repoInput.value}/labels`)
  updateLabelsList()

  showLoading(false)  //  Un-show loading spinner

}

formElement.addEventListener('submit', handleSubmit)
formElement.addEventListener('reset', () => showFormError(''))

//  ===========
// LABELS STATE
//  ===========

let labels = []

/** @type HTMLSectionElement */
const labelSection = document.getElementById('labels')
/** @type HTMLDivElement */
const labelNames = document.getElementById('label-names')
/** @type HTMLDivElement */
const labelConfigs = document.getElementById('label-configs')

/** Format incoming label data */
function formatLabels(data) {
  return data.map(({ name, color, description }) => ({
    name,
    color: color.startsWith('#') ? color : `#${color}`,
    description
  }))
}

const addButton = document.createElement('button')
addButton.innerText = "+"
addButton.addEventListener('click', () => { addLabel() })

/** Update Labels List Element */
function updateLabelsList() {

  clearLabelsList()

  for (const idx in labels) {
    const labelItem = document.createElement('div')

    const [r, g, b] = color(labels[idx].color).rgb().array()
    const [h, s, l] = color(labels[idx].color).hsl().array()

    labelItem.innerHTML = `
    <div class='label-name-container' data-idx="${idx}">
    <div class='label-name' style='--label-r: ${r}; --label-g: ${g}; --label-b: ${b}; --label-h: ${h}; --label-s: ${s}; --label-l: ${l};'>
    ${labels[idx].name}
    </div>
    </div>
    `
    labelNames.appendChild(labelItem)

    const labelConfig = document.createElement('div')
    let text = `
      <div class='label-config-container' data-idx="${idx}">
        <pre>${jsYaml.dump([labels[idx]])}</pre>
      </div>
    `
    text = text.replace(/(\w+):(\s*.+)/gim, '<span class="yaml-key">$1</span>:<span class="yaml-value">$2</span>')
    labelConfig.innerHTML = text
    labelConfig.classList.add('label-config')
    labelConfig.contentEditable = true
    labelConfig.addEventListener('blur', (e) => {
      editLabel(idx, labelConfig.innerText)
    })
    labelConfigs.appendChild(labelConfig)
  }
  const btn = document.createElement('div')
  btn.style.display = 'flex'
  btn.style.width = '100%'
  btn.style.justifyContent = 'center'
  btn.style.alignItems = 'center'
  btn.appendChild(addButton)
  labelConfigs.appendChild(btn)
}

function addLabel() {
  labels.push({
    name: 'label',
    color: '#000000',
    description: 'A new label'
  })
  updateLabelsList()
}

function editLabel(idx, content) {
  let newLabel = []

  if (!content) {
    removeLabel(idx)
    return
  }

  try {
    newLabel = jsYaml.load(content)
  } catch (err) {
    showFormError(err)
    return
  }
  if (newLabel?.length > 0) {
    labels.splice(idx, 1, ...newLabel)
  }
  removeLabel(idx)
  updateLabelsList()
}

function removeLabel(idx) {
  labelNames.querySelector(`[data-idx="${idx}"]`)?.remove()
  labelConfigs.querySelector(`[data-idx="${idx}"]`)?.remove()
}

/** Clears out the labels list */
function clearLabelsList() {
  labelNames.innerHTML = ''
  labelConfigs.innerHTML = ''
}


// ====
// COPY
// ====

/** @type HTMLButtonElement */
const copyYAMLButton = document.getElementById('copy-yaml')
/** @type HTMLButtonElement */
const copyJSONButton = document.getElementById('copy-json')

/** onCopy Button Click Handler */
function onCopy(type) {

  //  Determine the text to copy from the button type
  const text = type === 'yaml'
    ? jsYaml.dump(labels)
    : JSON.stringify(labels, null, 2)

  //  Write text to clipboard
  navigator.clipboard.writeText(text)

  //  Give user some visual feedback
  document.getElementById('copy-to-clipboard').innerText = `Copied as ${type.toUpperCase()} ✅`

}

copyYAMLButton.addEventListener('click', () => onCopy('yaml'))
copyJSONButton.addEventListener('click', () => onCopy('json'))

//  ============
//  THEME TOGGLE
//  ============

/** @type HTMLButtonElement */
const toggleThemeButton = document.getElementById('theme-toggle')

//  Toggle Theme Button Click Handler
toggleThemeButton.addEventListener('click', () => {

  //  Get current theme attribute
  const theme = toggleThemeButton.getAttribute('data-theme')

  if (theme === 'light') {

    //  Update theme attribute and toggle-button text
    toggleThemeButton.setAttribute('data-theme', 'dark')
    toggleThemeButton.innerText = '☀'

    //  Add dark class to all labels
    const labels = document.querySelectorAll('.label-name')
    for (const label of labels) { label.classList.add('dark') }

    //  Add dark class to body
    document.body.classList.add('dark')

  } else {

    //  Update theme attribute and toggle-button text
    toggleThemeButton.setAttribute('data-theme', 'light')
    toggleThemeButton.innerText = '🌙'

    //  Remove dark class from all labels
    const labels = document.querySelectorAll('.label-name')
    for (const label of labels) { label.classList.remove('dark') }

    //  Remove dark class from body
    document.body.classList.remove('dark')

  }

})

//  ================
//  HELPER FUNCTIONS
//  ================

//  LOADING SPINNER
//  ---------------

/** @type HTMLSectionElement */
const loadingSection = document.querySelector('.loading')

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

//  MISCELLANEOUS
//  -------------

/** Fetch and format label data */
async function fetchLabels(src) {
  const labels = await fetch(src)
    .then(res => res.json())
    .then(data => formatLabels(data))
    .catch(err => console.error(err))
  return labels
}
