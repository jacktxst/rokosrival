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
						let effectDiv = document.createElement("div")
							effectDiv.style.marginTop = "5px"
							effectDiv.style.marginLeft = "4px"

							if (effect.kind === "deploySubcard") {

								effectDiv.innerHTML = "Deploy:"
								// effectDiv.append(...effect.card.renderDetails())

							} else {
								effectDiv.innerHTML =  escapeHtml(formatEffect(effect))
							}

						effectsDiv.append(effectDiv)
					}

				let newEffectButton = document.createElement("button")
					newEffectButton.className="cheat-button"
					newEffectButton.innerHTML = "+"
					newEffectButton.addEventListener("click", ((e) => {

					}).bind(this))


			triggerDetails.append(triggerSummary, effectsDiv, newEffectButton)



			triggersDiv.append(triggerDetails)
		}

		let newTriggerButton = document.createElement("button")
			newTriggerButton.className = "cheat-button"
			newTriggerButton.innerHTML = "+"
			newTriggerButton.addEventListener("click", ((e) => {
				this.triggers.push(new Trigger({kind:"rest",effects:[]}))
				this.div.replaceChildren()
				this.div.append(...this.renderDetails())
				e.preventDefault()
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