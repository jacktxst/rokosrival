import { goToLobby } from './MenuLobby.js'
import { gameState, GameState } from './GameState.js'

export function goToMainMenu() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="rr-menu-main">
			<div id="rr-newgame-button" class="rr-menu-button">
				New Game
			</div>
			<div id="rr-continue-button" class="rr-menu-button">
				Continue
			</div>
		</div>

	`

	document.getElementById("rr-newgame-button").addEventListener("click",(e)=>{

		/* game state for a new game is already initialized in GameState.js */
		goToLobby()

	})

	document.getElementById("rr-continue-button").addEventListener("click",(e)=>{

		// gameState.loadFrom()
		goToLobby()
	})

}

