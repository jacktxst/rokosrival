import { CardDeck } from './CardDeck.js'

/**

	An instance of this class exists in each round for both the player and the opponent.

*/
export class CardPlayer {

	/**
	 * 	args: {turnCallback : Callable, name : String, deck : Array, game : CardGame}
	 */
	constructor(args) {
		this.doTurn = args.turnCallback
		this.name   = args.name || "Default Name"
		this.deck   = args.deck
		this.game   = args.game || null
	}

	/** called by CardGame when the game begins */
	beginGame() {

		this.health = 100
		this.energy = 0
		this.deck.unshuffleCards()
		this.deck.shuffleCards()
		this.hand = this.deck.drawCards(5)
		this.opponent = (this === this.game.player1) ? this.game.player2 : this.game.player1
	}

	/**
	
		renders the board from this player's perspective, and is responsible for setting up event listeners on the cards themselves

	*/
	renderBoard(){ 
		const opponent = this.opponent
		document.getElementById("board").innerHTML = `
			<div class="rr-opp-battle-stat">
				${opponent.name}: ${opponent.health} HP
			</div>

			<div class="rr-hand-container">
				<div class="rr-hand-container" id="rr-opp-hand">
					${(()=>{
						let string = ""
						for (let i=0;i<5;i++) {
							string += `
								<div class="rr-card rr-card-backside"></div>
							`
						}
						return string
					})()}
				</div>
			</div>
			
			<div class="rr-hand-container">
				<div class="rr-hand-container" id="rr-user-hand">
					${(()=>{
						let string = ""
						console.log(this.hand.length)
						for (let i=0;i<this.hand.length;i++) {
							string += `
								<div class="rr-card rr-card-frontside">

									<h3>${this.hand[i].name}</h3>
									${this.hand[i].note}
								</div>
							`
						}
						return string
					})()}
				</div>
			</div>
						
			<div class="rr-user-battle-stat">
				${this.name}: ${this.health} HP
			</div>	
		`

		let userCardDivs = document.getElementById("rr-user-hand").children
		if (!userCardDivs) return
		// turn the card black on click, just for testing interaction
		for(let i=0;i<userCardDivs.length;i++) {
			userCardDivs[i].addEventListener("click",(e)=>{
				this.played_card = i
				this.hand[i].onPlay?.bind(this)()
				
				// discard and draw

				this.hand.splice(i, 1)
				this.hand = [...this.hand, ...this.deck.drawCards(1)]

				// update display

				this.renderBoard()
			})
		}

		// 
	}

}