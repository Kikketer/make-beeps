// Popup script for BeepBox to MakeCode Arcade converter extension

const dropZone = document.getElementById('dropZone')
const fileInput = document.getElementById('fileInput')
const statusDiv = document.getElementById('status')
const songNameInput = document.getElementById('songName')

// Check if we're on the correct domain
async function checkDomain() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.url.includes('arcade.makecode.com')) {
      updateStatus(
        'warning',
        'Please open this extension while on arcade.makecode.com',
      )
      return false
    }

    hideStatus()
    return true
  } catch (error) {
    updateStatus('error', 'Error checking domain: ' + error.message)
    return false
  }
}

// Update status message
function updateStatus(type, message) {
  showStatus()
  statusDiv.innerHTML = ''
  const p = document.createElement('p')
  p.style.margin = '0'
  p.textContent = message
  statusDiv.appendChild(p)

  // Update style based on type if needed, though CSS handles colors
  statusDiv.style.textAlign = 'center'
  statusDiv.style.padding = '0.5rem'
}

function hideStatus() {
  statusDiv.classList.add('hidden')
}

function showStatus() {
  statusDiv.classList.remove('hidden')
}

// Handle file selection
function handleFile(file) {
  if (!file) return

  if (!file.name.endsWith('.json')) {
    showStatus()
    updateStatus('error', 'Please select a JSON file')
    return
  }

  showStatus()
  updateStatus('info', 'Reading file...')

  const reader = new FileReader()

  reader.onload = async (e) => {
    try {
      const beepBoxSong = JSON.parse(e.target.result)

      // Validate it's a BeepBox song
      if (!beepBoxSong.channels || !beepBoxSong.beatsPerBar) {
        updateStatus('error', 'Invalid BeepBox JSON format')
        return
      }

      updateStatus('info', 'Converting...')

      // Convert using the converter
      const songName = songNameInput.value.trim() || 'convertedSong'
      const pasteData = generatePasteJSON(beepBoxSong, songName)

      // Send to content script to update localStorage
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })

      if (!tab.url.includes('arcade.makecode.com')) {
        updateStatus('error', 'Please switch to an arcade.makecode.com tab')
        return
      }

      // Inject content script and send message
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      })

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'updateLocalStorage',
        data: pasteData,
      })

      if (response.success) {
        updateStatus(
          'success',
          `Song "${songName}" converted! Click in the MakeCode Arcade blocks editor and press Ctrl+V (Cmd+V on Mac) to paste your song.`,
        )
      } else {
        updateStatus(
          'error',
          'Failed to update localStorage: ' + response.error,
        )
      }
    } catch (error) {
      updateStatus('error', 'Error: ' + error.message)
      console.error('Conversion error:', error)
    }
  }

  reader.onerror = () => {
    updateStatus('error', 'Error reading file')
  }

  reader.readAsText(file)
}

// Click to select file
dropZone.addEventListener('click', () => {
  fileInput.click()
})

// File input change
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]
  handleFile(file)
})

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('drag-over')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')

  const file = e.dataTransfer.files[0]
  handleFile(file)
})

// Check domain on load
checkDomain()
