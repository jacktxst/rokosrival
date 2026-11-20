import { goToLobby } from './MenuLobby.js'
import { gameState, GameState } from './GameState.js'
import {goToCreateMultiplayerGame} from "./MenuCreateMultiplayerGame.js";

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
			
			<div id="create-game-button" class="stone-button">
				Create Multiplayer Game
			</div>
			
			<div id="join-game-button" class="stone-button">
				Join Multiplayer Game
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

	document.getElementById("create-game-button").addEventListener("click",(e)=>{

		// gameState.loadFrom()
		goToCreateMultiplayerGame()

	})

	document.getElementById("join-game-button").addEventListener("click",(e)=>{

		// gameState.loadFrom()

	})

}

