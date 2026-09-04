/*

	An instance of this class exists in each round for both the player and the opponent.

*/
export class CardPlayer {

	constructor(args) {

		this.doTurn = args.turnCallback

		this.health = 100
		this.energy = 0
		this.name   = name | "Default Name"

		this.deck   = []
		this.hand   = []
		this.game   = args.game | null

	}

	/*

		Called by the game manager whenever the opponent's turn is finished

	*/

	/*

		It took me a second to figure this out, that this function should be called by CardPlayer
		why? because each player has a unique view of the board. they can see their cards, but not the opponents.

	*/
	renderBoard(){
		/*

			

		*/
		const opponent = (this === this.game.player1) ? this.game.player2 : this.game.player1
		document.getElementById("board").innerHTML = `
		<div class="rr-opp-battle-stat">
			${opponent.health} health
		</div>
		<div class="rr-hand-container">
			<div class="rr-opp-hand">
				${(()=>{
					let string = ""
					for (let i=0;i<5;i++) {
						string += `
							<div class="rr-card-backside"></div>
						`
					}
					return string
				})()}
			</div>
		</div>
		
		<div class="rr-hand-container">
			<div class="rr-user-hand">
				${(()=>{
					let string = ""
					for (let i=0;i<5;i++) {
						string += `
							<div class="rr-card-frontside"></div>
						`
					}
					return string
				})()}
			</div>
		</div>
					
		<div class="rr-user-battle-stat">
			${this.health} health
		</div>	

		`
	}

}