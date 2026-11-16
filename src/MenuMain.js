import { goToLobby } from './MenuLobby.js'
import { gameState, GameState } from './GameState.js'

export function goToMainMenu() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="main-menu">

			<div id="new-game-button" class="stone-button">
				New Game
			</div>

			<div id="continue-button" class="stone-button">
				Continue
			</div>

		</div>

	`

	document.getElementById("new-game-button").addEventListener("click",(e)=>{

		/* game state for a new game is already initialized in GameState.js */
		goToLobby()

	})

	document.getElementById("continue-button").addEventListener("click",(e)=>{

		// gameState.loadFrom()
		
	})

}

