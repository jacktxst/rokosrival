import { gameState, GameState } from './GameState.js'
import { ViewCardGame } from './ViewCardGame.js'
import {CardPlayerBot} from './CardPlayerBot.js'
import {CardPlayerHuman} from './CardPlayerHuman.js'
import {CardDeck} from './CardDeck.js'
import {CardGame} from './CardGame.js'


import {goToMainMenu} from './MenuMain.js'

/*

	The lobby screen, for now, is the screen that the player always 
	enters into when the game starts.

	From this screen, the player can view their deck, 
	the status of their playthrough,
	and can start the next round.

	Additionally, once saving is added, 
	I think the game should only be saveable from the lobby,
	not during or right after a match.

*/
export function goToLobby() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="lobby">

			<div id="exit-button" class="stone-button">
				Exit To Main Menu
			</div> 
			
			<h1 class="shadow-overlay"> Match No.: ${gameState.matchNumber} </h1>

			<div id="ready-button" class="stone-button">
				Ready
			</div> 
			
			<h1 class="shadow-overlay"> Your Deck: </h1>

			<div class="shadow-overlay" style="max-height: 300px; display: grid; grid-template-columns: auto auto auto; overflow: auto; ">

			${ 
				(()=>{let text = ""
					for (let card of gameState.playerDeck.cards) {
						text += card.renderHTML()
					}
					return text;
				})()

			}
				
			</div>
		</div>

	`

	document.getElementById("exit-button").addEventListener("click",(e)=>{

		goToMainMenu()

	})

	document.getElementById("ready-button").addEventListener("click",(e)=>{

		let p1   = new CardPlayerHuman({ deck:new CardDeck(gameState.cardLibrary.cards), name: "You"})
		let p2   = new CardPlayerBot  ({ deck:new CardDeck(gameState.cardLibrary.cards), name: "CPU"})
		let game = new CardGame(p1, p2, null)
		

		gameState.currentGameView = new ViewCardGame(game)
		game.view = gameState.currentGameView

		game.beginGame()

	})

}

