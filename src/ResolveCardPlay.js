import { Card } from "./Card.js";
import { DeployedCard } from './DeployedCard.js'

import "./CardDefinitions.js";
import { CardGame } from "./CardGame.js";
import { gameState } from './GameState.js'
import { assert } from "./Helpers.js"

let isEffectInProgress = false

export let eventQueue = []

export class TriggerCardEvent {
	constructor(target, triggerKind) {
		this.state = "hasnt-started"
		this.kind = "trigger-card"
		this.target = target 
		this.triggerKind = triggerKind
		this.timeRemaining = 0
	}
}

export class GatherTargetsEvent {
	constructor(originator, effect) {
		this.state = "hasnt-started"
		this.kind = "gather-targets"
		this.originator = originator
		this.effect = effect
		this.timeRemaining = 0
	}
}

export class AnimateEffectEvent {
	constructor(originator, effect) {
		this.state = "hasnt-started"
		this.kind = "animate-effect"
		this.originator = originator
		this.targetList = [] // will be filled when a GatherTargetsEvent runs beforehand
		this.effect = effect
		this.timeRemaining = 0
	}
}

export class ReturnControlEvent {
	constructor() {
		this.state = "hasnt-started"
		this.kind = "return-control"
		this.timeRemaining = 0
	}
}

let lastTime = null

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
					console.log(`card triggered! targettypekind: ${e.target.type.kind} triggerkind:${e.triggerKind} `)
					let newEvents = []

					for (let trigger of e.target.triggers) {
						if (trigger.kind === e.triggerKind) {
							console.log("matching trigger found on card!")
							for (let effect of trigger.effects) {
								console.log("effect queued...")
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
						switch( e.effect.selection.mode ) {

							case "direct":
								if (e.effect.selection.target.kind === "player") {
									eventQueue.splice(0,1)
									console.log("targeting player")
									switch (e.effect.selection.target.alignment) {
										case "friendly":
											eventQueue[0].targetList = [e.originator.owner]
											break;
										case "enemy":
											eventQueue[0].targetList = [e.originator.owner.opponent]
											break;
									}
								}
								e.originator.owner.selectTargets(1, e.effect.selection.target.alignment, e.effect.selection.target.kind, (targets)=>{
									eventQueue.splice(0,1)
									eventQueue[0].targetList = targets
								})
								break;
							case "random":
								eventQueue.splice(0,1)
								// TODO : implement RANDOM select mode
								eventQueue[0].targetList = []
								break;
							case "twinned":
								e.originator.owner.selectTargets(2, e.effect.selection.target.alignment, e.effect.selection.target.kind, (targets)=>{
									eventQueue.splice(0,1)
									eventQueue[0].targetList = targets
								})
								break;
							case "split":
								e.originator.owner.selectTargets(2, e.effect.selection.target.alignment, e.effect.selection.target.kind, (targets)=>{
									eventQueue.splice(0,1)
									eventQueue[0].targetList = targets
								})
								break;
							case "self":
								eventQueue.splice(0,1)
								eventQueue[0].targetList = [e.originator]
								break;



						}	
					}
					

					break;

				case "animate-effect":
					console.log(`animate-effect ${e.effect.kind}`)
					e.state = "in-progress"
					switch (e.effect.kind) {

						case "attack": // can trigger: THORN, EXIT
							let damage = e.effect.amount
							if (e.effect.selection.mode === "split") {
								damage /= e.targetList.length
							}
							for (let target of e.targetList) {
								target.health -= damage
								eventQueue.splice(1, 0, new TriggerCardEvent(target, "thorn") )
								e.timeRemaining = 500
							}
							break;
						case "heal":
							let healAmount = e.effect.amount
							if (e.effect.selection.mode === "split") {
								healAmount /= e.targetList.length
							}
							for (let target of e.targetList) {
								if (target.type.kind === "spell") {
									target = target.owner
								}
								target.health += healAmount
								e.timeRemaining = 500
							}
							break;
						case "defend":
							break;
						case "surge":
							break;
						case "decay":
							break;
						case "destroy": // can trigger: EXIT
							break;
						case "draw":
							break;
						case "discard":
							break;
						case "predict":
							break;
						case "deploySubcard": // can trigger: GREET, ENTRY
							console.log(`DEPLOYING SUBCARD..? ${e.effect.card.type.kind}`)
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
					isEffectInProgress = false;
					gameState.currentGameView.cardGame.currentPlayer.doTurn()
					break;
			}

			break;

		case "in-progress":
			if (e.kind === "gather-targets") break;
			e.timeRemaining -= deltaTime
			if (e.timeRemaining <= 0) {
				eventQueue.splice(0,1)
			}
			break;

	}

	

}

resolveLoop()

