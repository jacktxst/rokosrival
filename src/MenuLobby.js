import { game, Game } from './Game.js'
import { CardGameRenderer } from './CardGameRenderer.js'
import {CardPlayerBot} from './CardPlayerBot.js'
import {CardPlayerHuman} from './CardPlayerHuman.js'
import {CardDeck} from './CardDeck.js'
import {CardGame} from './CardGame.js'


import {goToMainMenu} from './MenuMain.js'
import {showCardsInDiv} from "./Helpers.js";

/*

	The lobby screen, for now, is the screen that the player always 
	enters into when the game starts.

	From this screen, the player can view their deck, 
	the status of their playthrough,
	and can start the next round.

	Additionally, once saving is added, 
	I think the game should only be savable from the lobby,
	not during or right after a match.

*/
export function goToLobby() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="lobby">

			<div id="exit-button" class="stone-button">
				Exit To Main Menu
			</div> 
			
			<h1 class="shadow-bg"> Match No.: ${game.matchNumber} </h1>

			<div id="ready-button" class="stone-button">
				Ready
			</div> 
			
			<h1 class="shadow-bg"> Your Deck: </h1>

			<div id="lobby-deck-display" class="shadow-bg" style="max-height: 300px; display: grid; grid-template-columns: auto auto auto; overflow: auto; justify-content: space-evenly">

				
			</div>
		</div>

	`

	showCardsInDiv(game.playerDeck.cards, document.getElementById("lobby-deck-display"),"card")

	document.getElementById("exit-button").addEventListener("click",(e)=>{

		goToMainMenu()

	})

	document.getElementById("ready-button").addEventListener("click",(e)=>{

		game.beginRound()

	})

}

