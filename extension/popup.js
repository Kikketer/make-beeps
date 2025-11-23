// Popup script for BeepBox to MakeCode Arcade converter extension

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const statusDiv = document.getElementById('status');
const songNameInput = document.getElementById('songName');

// Check if we're on the correct domain
async function checkDomain() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('arcade.makecode.com')) {
      updateStatus('warning', '⚠️ Please open this extension while on arcade.makecode.com');
      return false;
    }
    
    updateStatus('info', '✅ Ready to convert! Select or drop a BeepBox JSON file.');
    return true;
  } catch (error) {
    updateStatus('error', '❌ Error checking domain: ' + error.message);
    return false;
  }
}

// Update status message
function updateStatus(type, message) {
  statusDiv.className = `status ${type}`;
  statusDiv.textContent = message;
}

// Handle file selection
function handleFile(file) {
  if (!file) return;
  
  if (!file.name.endsWith('.json')) {
    updateStatus('error', '❌ Please select a JSON file');
    return;
  }
  
  updateStatus('info', '📖 Reading file...');
  
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const beepBoxSong = JSON.parse(e.target.result);
      
      // Validate it's a BeepBox song
      if (!beepBoxSong.channels || !beepBoxSong.beatsPerBar) {
        updateStatus('error', '❌ Invalid BeepBox JSON format');
        return;
      }
      
      updateStatus('info', '🔄 Converting...');
      
      // Convert using the converter
      const songName = songNameInput.value.trim() || 'convertedSong';
      const pasteData = generatePasteJSON(beepBoxSong, songName);
      
      // Send to content script to update localStorage
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('arcade.makecode.com')) {
        updateStatus('error', '❌ Please switch to an arcade.makecode.com tab');
        return;
      }
      
      // Inject content script and send message
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'updateLocalStorage',
        data: pasteData
      });
      
      if (response.success) {
        updateStatus('success', `✅ Success! Song "${songName}" is ready to paste in MakeCode Arcade. Use Ctrl+V (Cmd+V on Mac) to paste.`);
      } else {
        updateStatus('error', '❌ Failed to update localStorage: ' + response.error);
      }
      
    } catch (error) {
      updateStatus('error', '❌ Error: ' + error.message);
      console.error('Conversion error:', error);
    }
  };
  
  reader.onerror = () => {
    updateStatus('error', '❌ Error reading file');
  };
  
  reader.readAsText(file);
}

// Click to select file
dropZone.addEventListener('click', () => {
  fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  handleFile(file);
});

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// Check domain on load
checkDomain();
