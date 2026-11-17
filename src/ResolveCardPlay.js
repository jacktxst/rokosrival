import { Card } from "./Card.js";
import { DeployedCard } from './DeployedCard.js'

import "./CardDefinitions.js";
import { CardGame } from "./CardGame.js";
import { gameState } from './GameState.js'
import { assert, randomInt } from "./Helpers.js"

/*

	Outside of this module, events come from two places:

	the play card function in CardPlayerBase

	and the yieldTurn function in CardGame.js

*/

export class GamePlayEvent {
	constructor() {
		this.state = "hasnt-started"
		this.timeRemaining = 0

	}
}

export class TriggerCardEvent extends GamePlayEvent {
	constructor(target, triggerKind) {
		super()
		this.kind = "trigger-card"

		this.target = target 
		this.triggerKind = triggerKind
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
					console.log(`${e.target.type.kind} card triggered! trigger kind: ${e.triggerKind}`)
					let newEvents = []

					for (let trigger of e.target.triggers) {
						if (trigger.kind === e.triggerKind) {
							console.log("matching trigger found on card!")
							for (let effect of trigger.effects) {
								console.log(`${effect.kind} effect queued...`)
								newEvents.push( 
									new GatherTargetsEvent(e.target, effect),
									new AnimateEffectEvent(e.target, effect)
								)
							}
						}
					}
					eventQueue.splice(0,1)
					eventQueue = [...newEvents, ...eventQueue]

					break;

				case "gather-targets":
					e.state = "in-progress"
					console.log(`gather targets! owner: ${e.originator.owner.name} `)
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

									e.originator.owner.selectFromCandidates(1, candidates, (targets)=>{
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
					console.log(`animate-effect ${e.effect.kind}`)
					e.state = "in-progress"
					switch (e.effect.kind) {

						case "attack": // should trigger: THORN, EXIT, GRIEVE
							let damage = e.effect.amount
							if (e.effect.selection.kind === "split among") {
								damage /= e.targetList.length
							}
							for (let target of e.targetList) {
								if (target.shield !== 0) {
									if (target.shield < damage) {
										damage -= target.shield
										target.shield = 0
									} else {
										target.shield -= damage
									}
								}
								target.health -= damage
								if (target.type.kind !== "player") eventQueue.splice(1, 0, new TriggerCardEvent(target, "thorn") )
								e.timeRemaining = 500
							}
							break;
						case "heal":
							let healAmount = e.effect.amount
							if (e.effect.selection.kind === "split among") {
								healAmount /= e.targetList.length
							}
							for (let target of e.targetList) {
								target.health += healAmount
								e.timeRemaining = 500
							}
							break;
						case "defend":
							let armor = e.effect.amount
							if (e.effect.selection.kind === "split among") {
								armor /= e.targetList.length
							}
							for (let target of e.targetList) {
								target.shield += armor
								e.timeRemaining = 500
							}
							break;
						case "surge":
							surgeAmount = e.effect.amount
							if (e.effect.selection.kind === "split among") {
								surgeAmount /= e.targetList.length
							}
							for (let target of e.targetList) {
								target.mana += surgeAmount
								e.timeRemaining = 500
							}
							break;
						case "decay":
							decayAmount = e.effect.amount
							if (e.effect.selection.kind === "split among") {
								decayAmount /= e.targetList.length
							}
							for (let target of e.targetList) {
								target.mana -= decayAmount
								e.timeRemaining = 500
							}
							break;
						case "destroy": // can trigger: EXIT, GRIEVE
							for (let target of e.targetList) {
								eventQueue.splice(1,0, new TriggerCardEvent( target, "exit"))
								target.owner.activeCards = target.owner.activeCards.filter(item => item !== target)
								if (!target.isSubcard) {
									target.owner.discard.push(target)
								}
								e.timeRemaining = 500
							}
							break;
						case "draw":
							for (let target of e.targetList) {
								target.hand.push(...target.deck.drawCards(e.effect.amount))
								e.timeRemaining = 500
							}
							break;
						case "discard":
							for (let target of e.targetList) {
								for (let i = 0; i < e.effect.amount && i < target.hand.length; i++) {
									target.discard.push(target.hand.pop())
								}
							}	
							break;
						case "deploySubcard": // can trigger: GREET, ENTRY
							console.log(`DEPLOYING SUBCARD..? ${e.effect.card.type.kind}`)
							e.effect.card.isSubcard = true
							let subcard = new DeployedCard(e.effect.card , e.originator.owner)
							e.timeRemaining = 500
							e.originator.owner.activeCards.push(subcard)
							eventQueue.splice(1,0,new TriggerCardEvent(subcard,"entry"))
							gameState.currentGameView.renderBoard()
							subcard.owner = e.originator.owner
							break;

					}

					break;

				case "return-control":
					console.log("return control")
					eventQueue = [];
					gameState.currentGameView.cardGame.currentPlayer.doTurn()
					break;
			}

			break;

		case "in-progress":
			if (e.kind === "gather-targets") break;
			e.timeRemaining -= deltaTime
			if (e.timeRemaining <= 0) {
				eventQueue.splice(0,1)
				gameState.currentGameView.renderBoard()
			}
			break;

	}

	

}

resolveLoop()



