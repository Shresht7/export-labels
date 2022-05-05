//  Library
import jsYaml from 'https://cdn.skypack.dev/js-yaml'
import color from 'https://cdn.skypack.dev/color'

//  =======
//  ON LOAD
//  =======

document.addEventListener('DOMContentLoaded', async () => {
  showLoading(true)
  const theme = localStorage.getItem('color-theme') || 'light'
  setTheme(theme)
  LABELS = await fetchLabels('./data.json')
  refreshLabels()
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
  showLoading(false)
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
  LABELS = await fetchLabels(`https://api.github.com/repos/${userInput.value}/${repoInput.value}/labels`)
  refreshLabels()

  showLoading(false)  //  Un-show loading spinner

}

formElement.addEventListener('submit', handleSubmit)
formElement.addEventListener('reset', () => showFormError(''))

//  ============
//  LABELS STATE
//  ============

/**
 * Array of label entries
 * @type { { name: string, color: string. description: string }[] }
 */
let LABELS = []

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

/** Clears out the labels list */
function clearLabels() {
  labelNames.innerHTML = ''
  labelConfigs.innerHTML = ''
}

/** Creates a new label */
function addLabel() {
  LABELS.push({
    name: 'label',
    color: '#000000',
    description: 'A new label'
  })
  refreshLabels()
}

/** Edit the label with the given index and content */
function editLabel(idx, content) {

  //  If no content, remove label
  if (!content) {
    removeLabel(idx)
    return
  }

  //  Try to parse yaml and read new label
  let newLabel = []
  try {
    newLabel = jsYaml.load(content)
  } catch (err) {
    showFormError(err.message)
    return
  }

  // If successful, remove the original label and replace with the new one 
  if (newLabel?.length > 0) {
    LABELS.splice(idx, 1, ...newLabel)
  }
  removeLabel(idx)  //  Remove label from the UI as well
  refreshLabels()  //  Update labels UI

}

/** Removes label with the given index */
function removeLabel(idx) {
  labelNames.querySelector(`[data-idx="${idx}"]`)?.remove()
  labelConfigs.querySelector(`[data-idx="${idx}"]`)?.remove()
}

//  ----------------
//  UPDATE LABELS UI
//  ----------------

function createLabelName(idx) {
  const labelItem = document.createElement('div')

  const [r, g, b] = color(LABELS[idx].color).rgb().array()
  const [h, s, l] = color(LABELS[idx].color).hsl().array()

  const theme = toggleThemeButton.getAttribute('data-theme')

  labelItem.innerHTML = `
    <div class='label-name-container' data-idx="${idx}">
    <div class='label-name${theme === 'dark' ? ' dark' : ''}' style='--label-r: ${r}; --label-g: ${g}; --label-b: ${b}; --label-h: ${h}; --label-s: ${s}; --label-l: ${l};'>
    ${LABELS[idx].name}
    </div>
    </div>
    `
  labelNames.appendChild(labelItem)
}

function createLabelConfig(idx) {
  const labelConfig = document.createElement('div')
  let text = `
    <div class='label-config-container' data-idx="${idx}">
      <pre>${jsYaml.dump([LABELS[idx]])}</pre>
      <div class='remove-label-container'>
      <button class="label-config-close btn btn-round" data-idx="${idx}">❌</button>
      </div>
    </div>
  `
  text = text.replace(/(\w+):(\s*.+)/gim, '<span class="yaml-key">$1</span>:<span class="yaml-value">$2</span>')
  labelConfig.innerHTML = text
  labelConfig.classList.add('label-config')
  labelConfig.contentEditable = true
  labelConfig.addEventListener('click', (e) => {
    const tar = labelConfig.querySelector('.remove-label-container')
    tar?.remove()
  })
  labelConfig.addEventListener('blur', (e) => {
    editLabel(idx, labelConfig.innerText)
  })
  labelConfig.querySelector('.label-config-close')?.addEventListener('click', (e) => {
    LABELS.splice(idx, 1)
    removeLabel(e.target.getAttribute('data-idx'))
    refreshLabels()
  })
  labelConfigs.appendChild(labelConfig)
}

/** Update Labels List Element */
function refreshLabels() {
  clearLabels()
  for (const idx in LABELS) {
    createLabelName(idx)
    createLabelConfig(idx)
  }
  createAddLabelButton()
}

//  --------------------
//  Add New Label Button
//  --------------------

const addButton = document.createElement('button')
addButton.id = 'add-label-button'
addButton.innerText = "+"
addButton.classList.add('btn', 'btn-round')
addButton.addEventListener('click', () => { addLabel() })

/** Create AddLabelButton and append at the end of LabelConfigs */
function createAddLabelButton() {
  const btn = document.createElement('div')
  btn.style.display = 'flex'
  btn.style.width = '100%'
  btn.style.justifyContent = 'center'
  btn.style.alignItems = 'center'
  btn.appendChild(addButton)
  labelConfigs.appendChild(btn)
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
    ? jsYaml.dump(LABELS)
    : JSON.stringify(LABELS, null, 2)

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

function setTheme(theme) {
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
}

//  Toggle Theme Button Click Handler
toggleThemeButton.addEventListener('click', () => {
  const theme = toggleThemeButton.getAttribute('data-theme')
  setTheme(theme)
  localStorage.setItem('color-theme', theme)
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
