/**

	Represents a single match between two CardPlayers
	The opponents interact indirectly through this CardGame class, which they will share a reference to
	The CardGame also stores references to each of its Players

	[CardPlayer] <-> [CardGame] <-> [CardPlayer]

*/
class CardGame {

	constructor() {

		this.player1
		this.player2
		this.currentPlayer = this.player1

	}

	submitTurn() {

		if(this.currentPlayer === this.player1) {
			this.currentPlayer = this.player2
		} else {
			this.currentPlayer = this.player1
		}

		this.currentPlayer.doTurn()

	}

}