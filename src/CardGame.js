/**

	Represents a single match between two CardPlayers
	The opponents interact indirectly through this CardGame class, which they will share a reference to
	The CardGame also stores references to each of its Players

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/
export class CardGame {

	constructor(player1, player2, gameView) {
		this.view = gameView
		this.player1 = player1
		this.player2 = player2
		this.currentPlayer = player1
		player1.game = this
		player2.game = this
	}

	/** */
	beginGame() {
		this.player1.beginGame()
		this.player2.beginGame()
		this.view.renderBoard()
		this.currentPlayer.doTurn()
	}

	yieldTurn() {

		/* show the card that was just played */
		// note that renderBoard also removes event listeners, thus disabling the player from making a move. correct.

		this.view.renderBoard()

		/* give control to the current player after animation plays */

		this.view.showPlayedCard( ()=>{
			this.currentPlayer.doTurn()
		} )

		/* switch this.currentPlayer (before animation finishes) */

		if (this.currentPlayer === this.player1) {
			this.currentPlayer = this.player2
		} else {
			this.currentPlayer = this.player1
		}

	}

}