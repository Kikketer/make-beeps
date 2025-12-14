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

  const processFile = useCallback(
    async (file: File) => {
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
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
        })
      }
    },
    [songName],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const jsonFile = files.find((f) => f.name.endsWith('.json'))

      if (!jsonFile) {
        setResult({
          success: false,
          error: 'Please drop a JSON file',
        })
        return
      }

      await processFile(jsonFile)
    },
    [processFile],
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const copyToClipboard = async () => {
    if (result?.data) {
      try {
        await navigator.clipboard.writeText(
          JSON.stringify(result.data, null, 2),
        )
        alert('Copied to clipboard!')
      } catch {
        alert('Failed to copy to clipboard')
      }
    }
  }

  const downloadJSON = () => {
    if (result?.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json',
      })
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
        <h1>Make Beep</h1>
        <p className="subtitle">
          Convert BeepBox music to MakeCode Arcade format
        </p>
      </header>

      <main className="main">
        <div className="tv-wrap nes-container is-dark">
          <div className="input-section">
            <div className="nes-field is-dark">
              <label htmlFor="songName" className="nes-label">
                Song Name:
              </label>
              <input
                id="songName"
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Enter song name"
                className="nes-input"
              />
            </div>

            <div
              className={`drop-zone ${isDragging ? 'dragging' : ''} nes-container is-dark`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="drop-zone-content">
                <p className="drop-text">
                  Drag & Drop your BeepBox JSON file here
                </p>
                <p className="drop-or">or</p>
                <label htmlFor="file-input" className="nes-btn">
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
                    <h2>Conversion Successful!</h2>
                  </div>

                  <div className="result-actions">
                    <button className="nes-btn" onClick={copyToClipboard}>
                      Copy to Clipboard
                    </button>
                    <button className="nes-btn" onClick={downloadJSON}>
                      Download JSON
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
                  <h2>Conversion Failed</h2>
                  <p>{result.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <h3>How to Use:</h3>
        <ol>
          <li>Open BeepBox and create your music</li>
          <li>Save the music as a JSON file</li>
          <li>Drag/Drop that JSON file onto this tool</li>
          <li>Copy the converted MakeCode Arcade music</li>
          <li>Use the MakeCode Audio Import Chrome extension to import it</li>
        </ol>
        <div className="starter-download">
          <a
            href="https://www.beepbox.co/#9n90sbk0l00e02t1Ua7g02j07r1i0o533333333T1v1u40f0qww10r51d08A4F2B6Q0068Pf624E2b676T1v1ub7f0q0w10p7d23A5F4B9Q0001Pffa7E4b862363379T1v1u19f0q802d23A5F4B0Q0202PeebbE0T5v1u85f10l7q00d23HK-LBJrttAAAyqhh0E0T1v1u18f0q00d23A0F0B0Q0000Pf600E1617T5v1ua0f60m92hc1ea2k02f30req83431d37H_QiBy9asq99900h0E0T5v1u85f10l7q00d23HK-LBJrttAAAyqhh0E0T1v1u56f0qww10p71d03A5F5B9Q0001PfaedE4b762663777T7v1u70f40p61770q72f5q0E21990l65d06HT-SRJJJJIAAAAAh0IaE1c11b4z4z4z4z4z4z4z4z4zp28kFEZFg410g410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te2CzMQ10mg410g410g410g410o10g410g410g410g410g41w410g410g40te0"
            className="nes-btn is-warning"
            target="_blank"
          >
            Download Starter BeepBox Project
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
