import { Card } from "./Card.js";
import { DeployedCard } from './DeployedCard.js'

import "./CardDefinitions.js";
import { game } from './Game.js'
import { assert, randomInt } from "./Helpers.js"

/*

	Outside of this module, events come from two places:

	the play card function in CardPlayerBase

	and the yieldTurn function in CardGame.js

*/

export function clearEvents() {
	eventQueue = []
}

export class GamePlayEvent {
	constructor() {
		this.state = "hasnt-started"
		this.timeRemaining = 0

	}
}

export class TriggerCardEvent extends GamePlayEvent {
	constructor(triggeredCard, triggerKind, triggerArg=null) {
		super()
		this.kind = "trigger-card"

		this.triggeredCard = triggeredCard
		this.triggerKind = triggerKind
		this.triggerArg = triggerArg
	}
}

export class GatherTargetsEvent extends GamePlayEvent {
	constructor(originator, effect) {
		super()
		this.kind = "gather-targets"

		this.originator = originator
		this.effect = effect
	}
}

export class AnimateEffectEvent extends GamePlayEvent {
	constructor(originator, effect) {
		super()
		this.kind = "animate-effect"

		this.originator = originator
		this.targetList = [] // will be filled when a GatherTargetsEvent runs beforehand
		this.effect = effect
	}
}

export class ReturnControlEvent extends GamePlayEvent {
	constructor() {
		super()
		this.kind = "return-control"
	}
}

export function renderQueueHTML() {
	let html = ""

	for (let e of eventQueue){
		html += `
		<div>${e.kind}</div>
		`
	}

	return html;

}

export let eventQueue = []

let lastTime = null

function getSelectionCandidates(selection, originator) {

	let alignedCards = []
	let candidates = []

	switch (selection.targets.alignment) {
		case "any":
			alignedCards = [...originator.owner.activeCards, ...originator.owner.opponent.activeCards, originator.owner, originator.owner.opponent]
			break;
		case "friendly":
			alignedCards = [...originator.owner.activeCards, originator.owner]
			break;
		case "opposing":
			alignedCards = [...originator.owner.opponent.activeCards, originator.owner.opponent]
			break;
		default:
			console.log(`unknown selection.targets.alignment: ${selection.targets.alignment}`)
			break;
	}

	for (let deployedCard of alignedCards) {
		if (selection.targets.types.includes( deployedCard.type.kind )) {
			candidates.push(deployedCard)
		}
	}

	return candidates;
}

function cardMatchesTargets(card, targets, player) {

	switch (targets.alignment) {
		case "friendly":
			if (card.owner !== player) return false;
			break;
		case "opposing":
			if (card.owner !== player.opponent) return false;
			break;
		case "any":
			break;
	}

	for ( let type of targets.types ) {

		if (type === card.type.kind) return true;

	}

	return false;
}


function resolveLoop(timestamp) {

	if (!lastTime) lastTime = timestamp; 
	const deltaTime = (timestamp - lastTime);
	lastTime = timestamp;

	requestAnimationFrame(resolveLoop)

	let e = eventQueue[0]
	if (!e) return

	switch (e.state) {

		case "hasnt-started":

			switch (e.kind) {

				case "trigger-card": // expand into each triggered effect
					// console.log(`${e.triggeredCard.type.kind} card triggered! trigger kind: ${e.triggerKind}`)
					let newEvents = []

					for (let trigger of e.triggeredCard.triggers || []) { // this || check makes sure that if e.triggeredCard is a player, and thus .triggers is null, iterate over an empty list instead of null to prevent crash
						if (trigger.kind === e.triggerKind && (!e.triggerArg || cardMatchesTargets( e.triggerArg, trigger.targets, e.triggeredCard.owner ) )  ) { // TODO fix this shit
							console.log(`matching trigger found on card! ${e.triggeredCard.type.kind} ${e.triggerKind}`)
							for (let effect of trigger.effects) {
								console.log(`${effect.kind} effect queued...`)
								newEvents.push( 
									new GatherTargetsEvent(e.triggeredCard, effect),
									new AnimateEffectEvent(e.triggeredCard, effect)
								)
							}
						}
					}
					eventQueue.splice(0,1)
					eventQueue = [...newEvents, ...eventQueue]

					break;

				case "gather-targets":
					e.state = "in-progress"
					console.log(`${e.originator.owner.name} gather targets for ${e.effect.kind}`)
					if (!e.effect.selection) {
						console.log("no selection required, skipping...")
						eventQueue.splice(0,1)

					} else {
						switch( e.effect.selection.kind ) {

							case "specified":
								{
									const candidates = getSelectionCandidates(e.effect.selection, e.originator)

									e.originator.owner.selectFromCandidates(1, candidates, (targets)=>{
										eventQueue.splice(0,1)
										eventQueue[0].targetList = targets
									})
								}
								break;
							case "random":
								{
									const candidates = getSelectionCandidates(e.effect.selection, e.originator)
									eventQueue.splice(0,1)
									eventQueue[0].targetList = [ candidates[ randomInt( Math.random, 0, candidates.length - 1 ) ] ]
								}		
								break;
							case "each":
								{
									const candidates = getSelectionCandidates(e.effect.selection, e.originator)
									eventQueue.splice(0,1)
									eventQueue[0].targetList = candidates
								}
								break;
							case "split among":
								{
									const candidates = getSelectionCandidates(e.effect.selection, e.originator)

									e.originator.owner.selectFromCandidates(99, candidates, (targets)=>{
										eventQueue.splice(0,1)
										eventQueue[0].targetList = targets
									})
								}
								break;
							case "self":
								{
									eventQueue.splice(0,1)
									if (e.originator.type.kind === "spell") {
										eventQueue[0].targetList = [e.originator.owner]
									} else {
										eventQueue[0].targetList = [e.originator]		
									}
								}
								break;
							default:
								console.log(`unknown selection mode! ${e.effect.selection.kind}`)
								break;
						}	
					}
					

					break;

				case "animate-effect":
					console.log(`animate-effect ${e.effect.kind} ${e.targetList[0]?.type.kind || "none"}...`)
					e.state = "in-progress"

					let amount = e.effect.amount
					if (e.effect.kind !== "deploySubcard") {
						if (e.effect.selection.kind === "split among") {
							amount /= e.targetList.length
						}
					}

					switch (e.effect.kind) {

						case "attack": // should trigger: THORN, EXIT, GRIEVE
							for (let target of e.targetList) {
								target.attack(e.originator, amount)
							}
							e.timeRemaining = 1000
							break;
						case "heal":
							for (let target of e.targetList) {
								target.health += amount
							}
							e.timeRemaining = 1000
							break;
						case "defend":

							for (let target of e.targetList) {
								target.shield += amount
							}
							e.timeRemaining = 1000
							break;
						case "surge":

							for (let target of e.targetList) {
								target.mana += amount

							}
							e.timeRemaining = 1000
							break;
						case "decay":
							for (let target of e.targetList) {
								target.mana -= amount
								if (target.mana <= 0) {target.fizzle()}
							}
							e.timeRemaining = 1000
							break;
						case "destroy": // can trigger: EXIT, GRIEVE
							for (let target of e.targetList) {
								target.fizzle()
							}
							e.timeRemaining = 1000
							break;
						case "draw":
							for (let target of e.targetList) {
								if (target.type.kind !== "player") continue;
								target.hand.push(...target.deck.drawCards(e.effect.amount))
							}
							e.timeRemaining = 1000
							break;
						case "discard":
							for (let target of e.targetList) {
								if (target.type.kind !== "player") continue;
								for (let i = 0; i < e.effect.amount && i < target.hand.length; i++) {
									target.discard.placeCards([target.hand.pop()])
								}
							}	
							break;
						case "deploySubcard": // can trigger: GREET, ENTRY
							console.log(`DEPLOYING SUBCARD..? ${e.effect.card.type.kind}`)
							e.effect.card.isSubcard = true
							let subcard = new DeployedCard(e.effect.card , e.originator.owner)
							e.timeRemaining = 1000
							e.originator.owner.activeCards.push(subcard)

							for (let card of [...e.originator.owner.activeCards, ...e.originator.owner.opponent.activeCards]) {

								eventQueue.splice(1,0,new TriggerCardEvent( card, "greet", subcard ))
							}

							eventQueue.splice(1,0,new TriggerCardEvent(subcard,"entry"))
							game.renderer.renderBoard()
							subcard.owner = e.originator.owner
							break;

					}

					break;

				case "return-control":
					console.log("return control")
					eventQueue.length=0;
					game.renderer.renderBoard()
					game.cardGame.currentPlayer.doTurn()
					break;
			}

			break;

		case "in-progress":
			if (e.kind === "gather-targets") break;
			e.timeRemaining -= deltaTime
			if (e.timeRemaining <= 0) {
				eventQueue.splice(0,1)
				game.renderer.renderBoard()
			}
			break;

	}
}

resolveLoop()



