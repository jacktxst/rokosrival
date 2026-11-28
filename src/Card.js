// Card.js
import {CardType, Effect, Targets, Trigger, TYPE} from "./CardDefinitions.js";
import {assert} from "./Helpers.js"
import { capitalize, escapeHtml } from './Helpers.js'
import {formatCost, formatTrigger, formatCard, formatEffect, formatSelection} from './CardFormatHelpers.js'
import * as Defs from "./CardDefinitions.js";

export class Card {

	constructor({ id, type, costs = [], arcane = false, triggers = [], owner = { kind: "inherited" } }) {
		// assert(type instanceof CardType, "Card type must be a CardType instance");
		// assert(typeof id === "string", "Card id must be a string");

		// assert(typeof id === "string" && id.length > 0, "id must exist and not be empty lol");
		// assert(type instanceof CardTypeSpec, "card type must be a CardTypeSpec");
		// assert(costs.every((cost) => cost instanceof CostSpec), "card costs must be CostSpec instances");
		// assert(triggers.every((trigger) => trigger instanceof TriggerSpec), "card triggers must be TriggerSpec instances");

		this.id = id;
		this.type = type;
		this.costs = costs;
		this.arcane = Boolean(arcane);
		this.triggers = triggers;
		this.owner = owner;

	}

	getData() {
		return {
			id: this.id,
			type: this.type,
			costs: this.costs,
			arcane: this.arcane,
			triggers: this.triggers,
		}
	}

	getHeaderNumber() {
		return this.type.initialValue
	}

	renderDetails() {

		function createEffectDiv(effect, trigger, effectsDiv) {
			let effectDiv = document.createElement("div")
				effectDiv.style.marginTop = "5px"
				effectDiv.style.marginLeft = "4px"

				let removeEffectButton = document.createElement("button")
					removeEffectButton.className ="cheat-button"
					removeEffectButton.innerHTML="x"
					removeEffectButton.addEventListener("click", (e) => {
						trigger.effects = this.triggers.filter(item => item !== effect)
						effectsDiv.removeChild(effectDiv)
					})
				effectDiv.append(removeEffectButton)

				let changeEffectButton = document.createElement("button")
					changeEffectButton.className ="cheat-button"
					changeEffectButton.innerHTML=">"
					changeEffectButton.addEventListener("click", (e) => {
						const mapping = {
							attack:"heal",
							heal:"defend",
							defend:"decay",
							decay:"destroy",
							destroy:"surge",
							surge:"draw",
							draw:"discard",
							discard:"attack"
						}
						effect.kind = mapping[effect.kind]
						let changedDiv = createEffectDiv.bind(this)(effect, trigger, effectsDiv)
						effectsDiv.insertBefore(changedDiv, effectDiv, )
						effectsDiv.removeChild(effectDiv)
					})
				effectDiv.append(changeEffectButton)

				let amountUpButton = document.createElement("button")
					amountUpButton.className ="cheat-button"
					amountUpButton.innerHTML="+"
					amountUpButton.addEventListener("click", (e) => {
						effect.amount++;
						let changedDiv = createEffectDiv.bind(this)(effect, trigger, effectsDiv)
						effectsDiv.insertBefore(changedDiv, effectDiv, )
						effectsDiv.removeChild(effectDiv)
					})

				let amountDownButton = document.createElement("button")
					amountDownButton.className ="cheat-button"
					amountDownButton.innerHTML="-"
					amountDownButton.addEventListener("click", (e) => {
						effect.amount--;
						let changedDiv = createEffectDiv.bind(this)(effect, trigger, effectsDiv)
						effectsDiv.insertBefore(changedDiv, effectDiv, )
						effectsDiv.removeChild(effectDiv)
				})

				const selectionStr = effect.selection?formatSelection(effect.selection):"";

				let to = effect.selection? (effect.selection.kind === Defs.SELECTION.SPLIT ? "" : " to "):"";

				switch (effect.kind) {
					case Defs.EFFECT.ATTACK:
						effectDiv.append("Deal ", amountDownButton, effect.amount, amountUpButton, " damage ", to, selectionStr)
						break;

					case Defs.EFFECT.DRAW:
						if(effect.selection.kind !== Defs.SELECTION.SELF) {
							// if amount is 1, use "a card", otherwise use "n cards"
							effectDiv.append(selectionStr, " draws ", amountDownButton, effect.amount === 1 ? "a" : effect.amount, amountUpButton, effect.amount === 1 ? "card" : "cards" )
						} else {
							// if selection is self, "You draw ..." instead of "<selection> draws ..."
							effectDiv.append("You draw ",amountDownButton,effect.amount === 1 ? "a" : effect.amount,amountUpButton,effect.amount === 1 ? "card" : "cards")
						}
						break;

					case Defs.EFFECT.DISCARD:
						if(effect.selection.kind !== Defs.SELECTION.SELF) {
							effectDiv.append(selectionStr, " discards ",amountDownButton,effect.amount === 1 ? "a" : effect.amount,amountUpButton,effect.amount === 1 ? "card" : "cards")
						} else {
							effectDiv.append("You discard ",amountDownButton,effect.amount === 1 ? "a" : effect.amount,amountUpButton,effect.amount === 1 ? "card" : "cards")
						}
						break;
					case Defs.EFFECT.DEFEND:
						effectDiv.append("Apply ",amountDownButton,effect.amount,amountUpButton," shield ",to,selectionStr)
						break;
					case Defs.EFFECT.HEAL:
						effectDiv.append("Heal ",amountDownButton,effect.amount,amountUpButton," life ",to,selectionStr)
						break;
					default:
						effectDiv.append(capitalize(effect.kind),"s",amountDownButton,effect.amount,amountUpButton,selectionStr)
						break;
				}

			return effectDiv;
		}

		function createTriggerDetails(trigger) {
			let triggerDetails = document.createElement("details")

			let triggerSummary = document.createElement("summary")
			triggerSummary.classList.add("trigger")
			triggerSummary.classList.add("trigger-"+trigger.kind)

			let deleteButton = document.createElement("button")
			deleteButton.classList.add("cheat-button")
			deleteButton.innerHTML="x"
			deleteButton.addEventListener("click", ((e) => {
				this.triggers = this.triggers.filter(item => item !== trigger)
				triggersDiv.removeChild(triggerDetails)
			}).bind(this))
			let changeButton = document.createElement("button")
			changeButton.className ="cheat-button"
			changeButton.innerHTML=">"
			changeButton.addEventListener("click", (e) => {
				const mapping = {
					rest:"awaken",
					awaken:"entry",
					entry:"thorn",
					thorn:"greet",
					greet:"grieve",
					grieve:"exit",
					exit:"rest"
				}
				triggerSummary.classList.remove("trigger-"+trigger.kind)
				trigger.kind = mapping[trigger.kind];
				triggerSummary.classList.add("trigger-"+trigger.kind)
				triggerText.innerHTML = escapeHtml(formatTrigger(trigger))
			})

			let triggerText = document.createElement("strong")
			triggerText.innerHTML = escapeHtml(formatTrigger(trigger))

			triggerSummary.append(deleteButton,changeButton,triggerText)



			let effectsDiv = document.createElement("div")

			for (let effect of trigger.effects) {
				effectsDiv.append(createEffectDiv.bind(this)(effect,trigger,effectsDiv))
			}

			let newEffectButton = document.createElement("button")
			newEffectButton.className="cheat-button"
			newEffectButton.innerHTML = "+"
			newEffectButton.addEventListener("click", ((e) => {
				let effect = new Effect("destroy",1,{kind:"specified",targets:new Targets({types:["player"],alignment:"any"})})
				trigger.effects.push(effect)
				effectsDiv.append(createEffectDiv.bind(this)(effect,trigger,effectsDiv))
			}).bind(this))


			triggerDetails.append(triggerSummary, effectsDiv, newEffectButton)

			return triggerDetails;
		}

		const title = `${capitalize(this.type.kind)} (${ this.getHeaderNumber() })`

		let titleBar = document.createElement("h3")
		titleBar.classList.add("rr-card-title")
		titleBar.innerHTML = escapeHtml(title)

		const costs = this.costs.map(formatCost)

		let cost  = document.createElement("div")
		cost.classList.add("rr-card-cost")
		cost.innerHTML = `Cost: ${costs.length ? costs.map(escapeHtml).join(', ') : 'Free'}${this.arcane ? ' · Arcane' : ''}`

		let triggersDiv = document.createElement("div")
		triggersDiv.classList.add("rr-card-triggers")

		for (let trigger of this.triggers) {

			triggersDiv.append(createTriggerDetails.bind(this)(trigger))
		}

		let newTriggerButton = document.createElement("button")
			newTriggerButton.className = "cheat-button"
			newTriggerButton.innerHTML = "+"
			newTriggerButton.addEventListener("click", ((e) => {
				let trigger = new Trigger({kind:"rest",effects:[]})
				this.triggers.push(trigger)
				triggersDiv.insertBefore(createTriggerDetails.bind(this)(trigger),triggersDiv.children[triggersDiv.children.length-1])
			}).bind(this))
		triggersDiv.append(newTriggerButton)

		this.detailsContent = [
			titleBar,
			cost,
			triggersDiv
		]
		return this.detailsContent;
	}

	render(cssClass) {
		this.div = document.createElement("div");
		this.div.className = cssClass;
		this.div.replaceChildren()
		this.div.append(...this.renderDetails())
		return this.div;
	}

}