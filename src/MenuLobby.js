import { gameState, GameState } from './GameState.js'
import { ViewCardGame } from './ViewCardGame.js'

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

		<div id="rr-menu-main">
			
			<h1> Match No.: ${gameState.matchNumber} </h1>


			<div id="rr-ready-button" class="rr-menu-button">
				Ready
			</div> 
			

			<div>


				<h1> Your Deck: </h1>


			</div>
		</div>

	`

	document.getElementById("rr-ready-button").addEventListener("click",(e)=>{

		this.p1   = new CardPlayerHuman({ deck:new CardDeck(gameState.cardLibrary.cards), name: "You"})
		this.p2   = new CardPlayerBot  ({ deck:new CardDeck(gameState.cardLibrary.cards), name: "CPU"})
		this.game = new CardGame(this.p1,this.p2,this)
		this.game.beginGame()

		gameState.currentGameView = new ViewCardGame()

	})

}

