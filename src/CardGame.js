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
		this.player1.renderBoard()
		this.currentPlayer.doTurn()
	}

	yieldTurn() {

		/* show the card that was just played */

		this.player1.renderBoard()

		document.getElementById("rr-played-card").style.display = "grid"
		document.getElementById("rr-played-card").innerHTML = `
			<div class="rr-card rr-card-frontside">
				<h3>${this.currentPlayer.playedCard.name}</h3>
				${this.currentPlayer.playedCard.note}
			</div>`

		/* switch this.currentPlayer */

		if (this.currentPlayer === this.player1) {
			this.currentPlayer = this.player2
		} else {
			this.currentPlayer = this.player1
		}

		/* give control to the current player after animation plays */

		setTimeout( (()=>{
			document.getElementById("rr-played-card").style.display = "none"
			this.currentPlayer.doTurn()
		}).bind(this), 1000)

		

		

		
	}

}