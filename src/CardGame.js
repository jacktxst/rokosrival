/**

	Represents a single match between two CardPlayers
	The opponents interact indirectly through this CardGame class, which they will share a reference to
	The CardGame also stores references to each of its Players

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/
export class CardGame {

	constructor(player1, player2) {
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
		this.currentPlayer.doTurn()
	}

}