import { CardPlayer } from './CardPlayer.js'
import { CardGame } from './CardGame.js'
import { CardDeck } from './CardDeck.js'
import { CardLibrary } from './CardLibrary.js'

import { p1Turn } from './GamePlayerController.js'
import { p2Turn } from './GameBotController.js'

function escapeHtml(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	})[character])
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatTarget(target) {
	return `${capitalize(target.alignment)} ${capitalize(target.kind)}`
}

function formatSelection(selection) {
	if (selection.mode === 'self') return 'Self'
	return `${capitalize(selection.mode)} ${formatTarget(selection.target)}`
}

function formatCost(cost) {
	switch (cost.kind) {
		case 'payMana':
			return `${cost.amount} Mana`
		case 'payLife':
			return `${cost.amount} Life`
		case 'fizzleFriendlyNonPlayers':
			return `Fizzle ${cost.amount} Friendly non-player(s)`
		default:
			return capitalize(cost.kind)
	}
}

function formatTrigger(trigger) {
	if (trigger.kind === 'greet') {
		return `Greet ${formatTarget(trigger.target)}`
	}
	return capitalize(trigger.kind)
}

function formatEffect(effect) {
	switch (effect.kind) {
		case 'destroy':
			return `Destroy ${formatSelection(effect.selection)}`
		case 'draw':
		case 'discard':
		case 'predict':
			return `${capitalize(effect.player)} player: ${capitalize(effect.kind)} ${effect.amount}`
		default:
			return `${capitalize(effect.kind)} ${effect.amount} ${formatSelection(effect.selection)}`
	}
}

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
				: ''}
		</li>
	`).join('')

	return `
		<h3 class="rr-card-title">${escapeHtml(title)}</h3>
		<div class="rr-card-cost">${costs.length ? costs.map(escapeHtml).join(', ') : 'Free'}${card.arcane ? ' · Arcane' : ''}</div>
		${triggers ? `<ul class="rr-card-triggers">${triggers}</ul>` : '<div class="rr-card-triggers">No triggers</div>'}
	`
}


/**

	ALL RENDERING CODE FOR THE CARD GAME	
c
*/

export class ViewCardGame {


	constructor() {
		this.cardLibrary = new CardLibrary()
		this.p1 = new CardPlayer({turnCallback:p1Turn, deck:new CardDeck(this.cardLibrary.cards), name: "You"})
		this.p2 = new CardPlayer({turnCallback:p2Turn, deck:new CardDeck(this.cardLibrary.cards), name: "CPU"})
		this.game = new CardGame(this.p1,this.p2,this)
		document.body.innerHTML = "<div id='board'></div> <div class='rr-played-card' id='rr-played-card-p1'></div> <div class='rr-played-card' id='rr-played-card-p2'></div>"
		this.game.beginGame()
	}

	/*

		After a card is played (by you or the opponent), 
		briefly show the card in the middle of the screen. 
		Otherwise you will not be able to know what your 
		opponent just played. 

	*/
	showPlayedCard(afterFunc) {

		let playedCardDiv = document.getElementById(this.game.currentPlayer === this.game.player1 ? "rr-played-card-p1" : "rr-played-card-p2")

		playedCardDiv.innerHTML = `
			<div class="rr-card rr-card-frontside">
				${renderCardDetails(this.game.currentPlayer.played_card)}
			</div>`
		playedCardDiv.style.opacity = "100%"

		setTimeout( (()=>{

			playedCardDiv.style.opacity = "0%"

			afterFunc()
			
		}).bind(this), 1000)

	}



	renderBoard(){ 
		const opponent = this.p2
		const p1 = this.p1
		document.getElementById("board").innerHTML = `
			<div class="rr-opp-battle-stat">
				${opponent.name}: ${opponent.health} HP
			</div>

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

			<div class="rr-hand-container">
				<div class="rr-hand-container" id="rr-user-hand">
					${(()=>{
						let string = ""
						for (let i=0;i<p1.hand.length;i++) {
							string += `
								<div class="rr-card rr-card-frontside">
									${renderCardDetails(p1.hand[i])}
								</div>
							`
						}
						return string
					})()}
				</div>
			</div>
						
			<div class="rr-user-battle-stat">
				${p1.name}: ${p1.health} HP ${p1.mana} MP

			</div>	

			<button id="rr-btn-end-turn">end turn</button>
		`

	}

}


	