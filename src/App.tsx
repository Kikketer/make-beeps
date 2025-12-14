import './App.css'

function App() {
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
          <section className="instructions-section">
            <h2>Getting Started</h2>

            <div className="step">
              <h3>Step 1: Get the Chrome Extension</h3>
              <p>
                Install the MakeCode Audio Import extension to enable importing
                BeepBox music directly into MakeCode Arcade.
              </p>
              <a
                href="https://chromewebstore.google.com/detail/makecode-audio-import/YOUR_EXTENSION_ID"
                className="nes-btn is-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Chrome Extension
              </a>
            </div>

            <div className="step">
              <h3>Step 2: Download Tuned Instruments</h3>
              <p>
                Download the tuned instruments JSON file and import it into
                BeepBox. This gives you instruments that are pre-configured to
                match MakeCode Arcade's sound capabilities.
              </p>
              <a
                href="/tuned-instruments.json"
                download="tuned-instruments.json"
                className="nes-btn is-warning"
              >
                Download Tuned Instruments
              </a>
              <img
                src="import-beep.gif"
                alt="Import BeepBox"
                aria-description="Showing the process of opening a BeepBox json file in BeepBox. The user is clicking the file -> open dialog and selecting the correct json file downloaded from earlier steps."
              />
            </div>

            <div className="step">
              <h3>Step 3: Create Your Music</h3>
              <p>
                Open BeepBox and import the tuned instruments, then compose your
                music using the pre-configured instruments.
              </p>
              <p>
                Note: Stay within the range of notes that are in the template.
                MakeCode MAY be able to play notes outside that range but it's
                not fully supported.
              </p>
              <a
                href="https://www.beepbox.co/"
                className="nes-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open BeepBox
              </a>
            </div>

            <div className="step">
              <h3>Step 4: Import to MakeCode</h3>
              <p>
                With the Chrome extension installed, open your MakeCode Arcade
                project. Open the extension and add your BeepBox song JSON file.
                Then paste into the block code screen on MakeCode Arcade and
                you'll have your song!
              </p>
              <img
                src="copy-makecode.gif"
                alt="Copy MakeCode"
                aria-description="Showing the process of selecting the BeepBox JSON file into the chrome extension then pasting in MakeCode Block editor."
              />
            </div>
          </section>
        </div>

        <section className="nes-container with-title">
          <h2>Why</h2>
          <p>
            This project started as a "why can't I get sharps and flats in
            MakeCode Arcade" question. From there I started reverse engineering
            the MakeCode Arcade music format, thank you MakeCode team for making
            this whole thing open source!
          </p>
          <p>
            After I understood that sharps and flats could be played in MakeCode
            I decided to take it one step further. The music editor in MakeCode
            Arcade is a bit difficult to use to make some real repeating and
            dynamic songs. BeepBox is commonly used by students to create some
            really cool music, so I thought to combine the two.
          </p>
          <p>
            The result is this sorta patch-work combination of using BeepBox to
            create your music but then able to import them into MakeCode Arcade
            using mostly unmodified aspects of each.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>
          MakeCode Arcade is a fantastic application for learning video game
          creation, please go check it out and give Microsoft a high five for
          funding and supporting such a great tool.
        </p>
        <p>
          This tool is not at all associated to Microsoft or MakeCode team
          directly.
        </p>
        <p>
          This tool was mostly vibe-coded over a few weeks, using AI tools to
          understand and reverse-engineer the sound creating code in MakeCode
          Arcade. Then set forth to translate the output of BeepBox into
          MakeCode Arcade music along with understanding the copy/paste format
          MakeCode Arcade uses.
        </p>
        <div className="footer-actions">
          <a
            href="https://github.com/kikketer/make-beeps"
            className="nes-btn is-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
