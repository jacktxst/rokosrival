// Card.js
import {CardType, Trigger, TYPE} from "./CardDefinitions.js";
import {assert} from "./Helpers.js"
import { capitalize, escapeHtml } from './Helpers.js'
import { formatCost, formatTrigger, formatCard, formatEffect } from './CardFormatHelpers.js'

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

			let triggerDetails = document.createElement("details")



				let triggerSummary = document.createElement("summary")
					triggerSummary.classList.add("trigger")
					triggerSummary.classList.add("trigger-"+trigger.kind)

					let deleteButton = document.createElement("button")
						deleteButton.class="cheat-button"
						deleteButton.innerHTML="x"
						deleteButton.addEventListener("click", ((e) => {
							this.triggers = this.triggers.filter(item => item !== trigger)
							triggersDiv.removeChild(triggerDetails)
						}).bind(this))
					let changeButton = document.createElement("button")
			            changeButton.class="cheat-button"
						changeButton.innerHTML=">"
						changeButton.addEventListener("click", (e) => {})

					let triggerText = document.createElement("strong")
						triggerText.innerHTML = escapeHtml(formatTrigger(trigger))

				triggerSummary.append(deleteButton,changeButton,triggerText)



				let effectsDiv = document.createElement("div")

					for (let effect of trigger.effects) {
						let effectDiv = document.createElement("div")
							effectDiv.style.marginTop = "5px"
							effectDiv.style.marginLeft = "4px"

							if (effect.kind === "deploySubcard") {

								effectDiv.innerHTML = "Deploy:"
								effectDiv.append(...effect.card.renderDetails())

							} else {
								effectDiv.innerHTML =  escapeHtml(formatEffect(effect))
							}

						effectsDiv.append(effectDiv)
					}



			triggerDetails.append(triggerSummary, effectsDiv)



			triggersDiv.append(triggerDetails)
		}

		let newTriggerButton = document.createElement("button")
			newTriggerButton.class = "cheat-button"
			newTriggerButton.innerHTML = "+"
			newTriggerButton.addEventListener("click", (e) => {
				this.triggers.push(new Trigger({kind:"rest",effects:[]}))
				this.div.replaceChildren()
				this.div.append(...this.renderDetails())
				e.preventDefault()
			})
		triggersDiv.append(newTriggerButton)

		return [
			titleBar,
			cost,
			triggersDiv
		]
	}

	render(cssClass) {
		let div = document.createElement("div");
		this.div = div;
		div.classList.add(cssClass);
		div.append(...this.renderDetails())
		return div;
	}

}