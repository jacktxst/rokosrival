export class CardPlayerHuman extends CardPlayer {

	doTurn() {

		let userCardDivs = document.getElementById("rr-user-hand").children
		if (!userCardDivs) return

		for(let i=0;i<userCardDivs.length;i++) {
			userCardDivs[i].addEventListener("click",(e)=>{

				this.playCardFromHand(i, this.doTurn )
				
				
			})
		}

		document.getElementById("rr-btn-end-turn").addEventListener("click",(e)=>{
			this.cardGame.yieldTurn()
		})

	}

	/* ask the player to select some active cards to target 

	   once the player has made their selection, callback will
	   be called with the result

	*/

	selectTargets( maxTargets, targetAlignment, targetKind, callback ) {

		let targets = []

		switch (targetAlignment) {

			case "opposing":

				let targetableDivs = document.getElementById("opposing-active-cards").children

				for (let i=0; i<targetableDivs.length; i++) {
					if (this.opponent.activeCards[i].kind == kind) {

						targetableDivs[i].classList.add("card-hoverable")

						targetableDivs[i].addEventListener("click",(e)=>{
							if ( targets.includes(i) ) {
								targets.remove(i)
							} else {
								targets.push(i)
							}
						})

					}
				}

				break;
			case "friendly":
				break;
			case "any":
				break;

		}

		/* TODO: create a submit selection thing */

	}

}