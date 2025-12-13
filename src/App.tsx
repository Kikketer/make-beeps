import { useState, useCallback } from 'react'
import './App.css'
import { generatePasteJSON } from './converter'

interface ConversionResult {
  success: boolean
  data?: Record<string, unknown>
  error?: string
}

function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [songName, setSongName] = useState('convertedSong')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const beepBoxSong = JSON.parse(text)
      
      // Validate that it's a BeepBox song
      if (beepBoxSong.format !== 'BeepBox') {
        throw new Error('Invalid file: Not a BeepBox song format')
      }

      const pasteJSON = generatePasteJSON(beepBoxSong, songName)
      
      setResult({
        success: true,
        data: pasteJSON,
      })
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [songName])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const jsonFile = files.find(f => f.name.endsWith('.json'))

    if (!jsonFile) {
      setResult({
        success: false,
        error: 'Please drop a JSON file'
      })
      return
    }

    await processFile(jsonFile)
  }, [processFile])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const copyToClipboard = async () => {
    if (result?.data) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))
        alert('Copied to clipboard!')
      } catch {
        alert('Failed to copy to clipboard')
      }
    }
  }

  const downloadJSON = () => {
    if (result?.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'makecode-paste.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎵 MakeCode Arcade Audio Converter</h1>
        <p className="subtitle">Convert BeepBox music to MakeCode Arcade format</p>
      </header>

      <main className="main">
        <div className="input-section">
          <div className="song-name-input">
            <label htmlFor="songName">Song Name:</label>
            <input
              id="songName"
              type="text"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="Enter song name"
            />
          </div>

          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <div className="drop-icon">📁</div>
              <p className="drop-text">Drag & Drop your BeepBox JSON file here</p>
              <p className="drop-or">or</p>
              <label htmlFor="file-input" className="file-input-label">
                Choose File
              </label>
              <input
                id="file-input"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        {result && (
          <div className="result-section">
            {result.success ? (
              <>
                <div className="success-header">
                  <h2>✅ Conversion Successful!</h2>
                </div>
                
                <div className="result-actions">
                  <button className="action-btn primary" onClick={copyToClipboard}>
                    📋 Copy to Clipboard
                  </button>
                  <button className="action-btn secondary" onClick={downloadJSON}>
                    💾 Download JSON
                  </button>
                </div>
                <div className="result-preview">
                  <h3>Full JSON Preview:</h3>
                  <pre className="json-preview">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="error-message">
                <h2>❌ Conversion Failed</h2>
                <p>{result.error}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="instructions">
          <h3>How to Use:</h3>
          <ol>
            <li>Open BeepBox and create your music</li>
            <li>Save the music as a JSON file</li>
            <li>Drag/Drop that JSON file onto this tool</li>
            <li>Copy the converted MakeCode Arcade music</li>
            <li>Use the MakeCode Audio Import Chrome extension to import it</li>
          </ol>
        </div>
      </footer>
    </div>
  )
}

export default App
