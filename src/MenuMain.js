import { goToLobby } from './MenuLobby.js'
import { gameState, GameState } from './GameState.js'

export function goToMainMenu() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="rr-menu-main">
			<div id="rr-play-button">
				New Game
			</div>
		</div>

	`

	document.getElementById("rr-play-button").addEventListener("click",(e)=>{

		goToLobby()

	})

}

