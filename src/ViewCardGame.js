/*

	This is the code responsible for 
	rendering the ongoing card match 
	as visible HTML elements.

*/

import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { gameState } from './GameState.js'
import { CardPlayerHuman } from './CardPlayerHuman.js'
import { CardPlayerBot } from './CardPlayerBot.js'
import { capitalize, escapeHtml } from './Helpers.js'
import { formatCost, formatTrigger, formatCard, formatEffect } from './CardFormatHelpers.js'

function renderCardDetails(card) {
	const title = `${capitalize(card.type.kind)} ${card.type.initialValue}`
	const costs = card.costs.map(formatCost)
	const triggers = card.triggers.map((trigger) => `
		<li>
			<strong>${escapeHtml(formatTrigger(trigger))}</strong>
			${trigger.effects.length
				? `<ul>${trigger.effects.map((effect) => `
					<li> 
						${effect.kind === 'deploySubcard'
							? `Deploy ${escapeHtml(capitalize(effect.card.type.kind))} ${effect.card.type.initialValue}${renderCardDetails(effect.card)}`
							: escapeHtml(formatEffect(effect))}
					</li>
				`).join('')}</ul>`
				: '..no effects..'}
		</li>
	`).join('')

	return `
		<h3 class="rr-card-title">${escapeHtml(title)}</h3>
		<div class="rr-card-cost">Cost: ${costs.length ? costs.map(escapeHtml).join(', ') : 'Free'}${card.arcane ? ' · Arcane' : ''}</div>
		${triggers ? `<ul class="rr-card-triggers">${triggers}</ul>` : '<div class="rr-card-triggers">No triggers</div>'}
	`
}


/*

	Main board rendering code:	

*/

export class ViewCardGame {


	constructor(cardGame) {
		
		this.cardGame = cardGame
		this.p1 = cardGame.player1 
		this.p2 = cardGame.player2
		
	}

	/*

		After a card is played (by you or the opponent), 
		briefly show the card in the middle of the screen. 
		Otherwise you will not be able to know what your 
		opponent just played. 

	*/
	showPlayedCard(afterFunc) {

		let playedCardDiv = document.getElementById(this.cardGame.currentPlayer === this.cardGame.player1 ? "rr-played-card-p1" : "rr-played-card-p2")

		playedCardDiv.innerHTML = `
			<div class="rr-card rr-card-frontside">
				${renderCardDetails(this.cardGame.currentPlayer.played_card)}
			</div>`
		playedCardDiv.style.opacity = "100%"

		setTimeout( (()=>{

			playedCardDiv.style.opacity = "0%"

			afterFunc()
			
		}).bind(this), 1000)

	}

	/*	
	=========================================
		renderBoard() 
	=========================================
		Clear the screen and render the 
		ongoing card match as visible 
		HTML elements. This function
		has the side effect of disabling
		player input even if it is their 
		turn.
	=========================================
	*/
	renderBoard(){ 

		document.body.innerHTML = "<div id='board'></div> <div class='rr-played-card' id='rr-played-card-p1'></div> <div class='rr-played-card' id='rr-played-card-p2'></div>"

		const opponent = this.p2
		const p1 = this.p1
		document.getElementById("board").innerHTML = `
			<div class="rr-opp-battle-stat">
				${opponent.name}: ${opponent.health} HP
			</div>

			<div class="innerboard">
				<div class="rr-hand-container">
					<div class="rr-hand-container" id="rr-opp-hand">
						${(()=>{
							let string = ""
							for (let i=0;i<opponent.hand.length;i++) {
								string += `
									<div class="rr-card rr-card-backside"></div>
								`
							}
							return string
						})()}
					</div>
				</div>
	
	
	
				<div class="active-cards" id="opponents-active-cards">
					${(()=>{
						let string = ""
						for (let card of opponent.activeCards) {
							string += `
								<div class="rr-card rr-card-frontside">
									${renderCardDetails(card)}
								</div>
							`
						}
						return string
					})()}
				</div>
	
				<div id="frontline"></div>
	
				<div class="active-cards" id="your-active-cards">
					${(()=>{
						let string = ""
						for (let card of p1.activeCards) {
							string += `
								<div class="rr-card rr-card-frontside">
									${renderCardDetails(card)}
								</div>
							`
						}
						return string
					})()}
				</div>
	
	
	
				<div class="rr-hand-container">
					<div class="rr-hand-container" id="rr-user-hand">
						${(()=>{
							let string = ""
							for (let i=0;i<p1.hand.length;i++) {
								string += `
									<div class="rr-card rr-card-frontside card-hoverable">
										${renderCardDetails(p1.hand[i])}
									</div>
								`
							}
							return string
						})()}
					</div>
				</div>
			</div>
						
			<div class="rr-user-battle-stat">
				${p1.name}: ${p1.health} HP ${p1.mana} MP
			</div>	

			<div id="rr-btn-end-turn" class="rr-menu-button">end turn</div>
		`

	}

}




	
