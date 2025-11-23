// Content script for updating localStorage on arcade.makecode.com

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateLocalStorage') {
    try {
      // Update the localStorage with the converted data
      // MakeCode Arcade uses 'arcade/copyData' as the key for paste data
      localStorage.setItem('arcade/copyData', JSON.stringify(request.data));
      
      console.log('Successfully updated arcade/copyData in localStorage');
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error updating localStorage:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  // Return true to indicate we'll send a response asynchronously
  return true;
});
