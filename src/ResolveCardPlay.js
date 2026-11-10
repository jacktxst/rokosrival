import { Card } from "./Card.js";
import "./CardDefinitions.js";
import { CardGame } from "./CardGame.js";

import { assert } from "./Helpers.js"

let isEffectInProgress = false

export let eventQueue = []

export class TriggerCardEvent {
	constructor(target, triggerKind) {
		this.kind = "trigger-card"
		this.target = target 
		this.triggerKind = triggerKind
	}
}

export class GatherTargetsEvent {
	constructor(originator, effect) {
		this.kind = "gather-targets"
		this.originator = originator
		this.effect = effect
	}
}

export class AnimateEffectEvent {
	constructor(effect) {
		this.kind = "animate-effect"
		this.targetList = [] // will be filled when a GatherTargetsEvent runs beforehand
		this.effect = effect
	}
}

export class ReturnControlEvent {
	constructor() {
		this.kind = "return-control"
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

					let newEvents = []

					for (let trigger of e.target.triggers) {
						if (trigger.kind === e.triggerKind) {
							for (let effect of trigger.effects) {
								newEvents.push( 
									new GatherTargetsEvent(e.target, effect),
									new AnimateEffectEvent(effect)
								)
							}
						}
					}
					eventQueue.splice(0,1)
					eventQueue.concat(newEvents, eventQueue)

					break;

				case "gather-targets":

					switch( e.effect.selection.mode ) {

						case "direct":
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

					break;

				case "animate-effect":

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
						case "deploy-subcard": // can trigger: GREET, ENTRY

							break;

					}

					break;

				case "return-control":
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

