import { goToLobby } from './MenuLobby.js'
import { gameState, GameState } from './GameState.js'

export function goToMainMenu() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="main-menu">

			<div id="main-menu-buttons">
				<div id="new-game-button" class="stone-button">
					New Game
				</div>

				<div id="import-save-button" class="stone-button">
					Import Save Data
				</div>
			</div>

			<div id="new-game-section">
				<label for="seed-input">Master Seed (optional):</label>
				<input type="text" id="seed-input" placeholder="Up to 12 characters (0-9, A-Z)" maxlength="12">
			</div>

			<textarea id="save-data-input" placeholder="Paste your save data here..."></textarea>

		</div>

	`

	document.getElementById("new-game-button").addEventListener("click",(e)=>{
		const seedInput = document.getElementById("seed-input").value.trim().toUpperCase()
		
		// Validate seed: only 0-9 and A-Z, max 12 characters
		if (seedInput && !/^[0-9A-Z]+$/.test(seedInput)) {
			alert("Master Seed must contain only numbers (0-9) and capital letters (A-Z).")
			return
		}

		if (seedInput.length > 12) {
			alert("Master Seed must be 12 characters or less.")
			return
		}

		// If seed provided, store it in gameState; otherwise use default
		if (seedInput) {
			gameState.masterSeed = seedInput
		}

		/* game state for a new game is already initialized in GameState.js */
		goToLobby()

	})

	document.getElementById("import-save-button").addEventListener("click",(e)=>{
		const saveDataInput = document.getElementById("save-data-input").value.trim()
		
		if(saveDataInput === "") {
			alert("No save data was provided")
		} else {
			alert("Couldn't read provided save data")
		}
	})
}

