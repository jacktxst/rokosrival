import {CardPlayerBase} from './CardPlayerBase.js'

export class CardPlayerHuman extends CardPlayerBase {

	/* 
	give the player the opportunity 
	to play multiple cards and then 
	end their turn 
	*/

	doTurn() {

		let userCardDivs = document.getElementById("rr-user-hand").children
		if (!userCardDivs) return

		for(let i=0;i<userCardDivs.length;i++) {
			userCardDivs[i].addEventListener("click",(e)=>{

				this.deployCardFromHand( i )
				
				
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
		let targetableDivs = []

		switch (targetAlignment) {

			case "opposing":

				targetableDivs = document.getElementById("opponents-active-cards").children

				for (let i=0; i<targetableDivs.length; i++) {
					if (this.opponent.activeCards[i].kind === targetKind) {

						targetableDivs[i].classList.add("card-hoverable")

						targetableDivs[i].addEventListener("click",(e)=>{
							if ( targets.includes(this.opponent.activeCards[i]) ) {
								targetableDivs[i].classList.remove("card-targeted")
								targets.remove(this.opponent.activeCards[i])
							} else {
								if (targets.length >= maxTargets) {

								} else {
									targetableDivs[i].classList.add("card-targeted")
									targets.push(this.opponent.activeCards[i])	
								}
							}
						})

					}
				}

				break;
			case "friendly":

				targetableDivs = document.getElementById("your-active-cards").children

				for (let i=0; i<targetableDivs.length; i++) {
					if (this.activeCards[i].kind === targetKind) {

						targetableDivs[i].classList.add("card-hoverable")

						targetableDivs[i].addEventListener("click",(e)=>{
							if ( targets.includes(this.activeCards[i]) ) {
								targetableDivs[i].classList.remove("card-targeted")
								targets.remove(this.activeCards[i])
							} else {
								if (targets.length >= maxTargets) {

								} else {
									targetableDivs[i].classList.add("card-targeted")
									targets.push(this.activeCards[i])	
								}
							}
						})

					}
				}

				break;
			case "any":

				targetableDivs = document.getElementById("opponents-active-cards").children

				for (let i=0; i<targetableDivs.length; i++) {
					if (this.opponent.activeCards[i].kind === targetKind) {

						targetableDivs[i].classList.add("card-hoverable")

						targetableDivs[i].addEventListener("click",(e)=>{
							if ( targets.includes(this.opponent.activeCards[i]) ) {
								targetableDivs[i].classList.remove("card-targeted")
								targets.remove(this.opponent.activeCards[i])
							} else {
								if (targets.length >= maxTargets) {

								} else {
									targetableDivs[i].classList.add("card-targeted")
									targets.push(this.opponent.activeCards[i])	
								}
							}
						})

					}
				}

				targetableDivs = document.getElementById("your-active-cards").children

				for (let i=0; i<targetableDivs.length; i++) {
					if (this.activeCards[i].kind === targetKind) {

						targetableDivs[i].classList.add("card-hoverable")

						targetableDivs[i].addEventListener("click",(e)=>{
							if ( targets.includes(this.activeCards[i]) ) {
								targetableDivs[i].classList.remove("card-targeted")
								targets.remove(this.activeCards[i])
							} else {
								if (targets.length >= maxTargets) {

								} else {
									targetableDivs[i].classList.add("card-targeted")
									targets.push(this.activeCards[i])	
								}
							}
						})

					}
				}

				break;

		}

		/* TODO: create a submit selection thing */
		document.getElementById("rr-btn-end-turn").innerHTML = "submit selection"
		document.getElementById("rr-btn-end-turn").addEventListener("click",(e)=>{
			this.cardGame.view.renderBoard()
			callback(targets)
		})

	}

}