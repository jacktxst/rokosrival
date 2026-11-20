// Card.js
import { CardType, TYPE } from "./CardDefinitions.js";
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

  renderDetailsHTML() {
  	const title = `${capitalize(this.type.kind)} (${ this.getHeaderNumber() })`
		const costs = this.costs.map(formatCost)
		const triggers = this.triggers.map((trigger) => `
			<div>	
				<details>
					<summary> <strong>${escapeHtml(formatTrigger(trigger))}</strong> </summary>
					${trigger.effects.length
						? `<div>${trigger.effects.map((effect) => `
							<div style="margin-top:5px; margin-left: 4px;"> 
								${effect.kind === 'deploySubcard'
									? `Deploy ${escapeHtml(capitalize(effect.card.type.kind))} ${effect.card.type.initialValue}${effect.card.renderDetailsHTML()}`
									: escapeHtml(formatEffect(effect))}
							</div>
						`).join('')}</div>`
						: '..no effects..'}
				</details>
			</div>
		`).join('')

		return ` 

				<h3 class="rr-card-title">${escapeHtml(title)}</h3>
				<div class="rr-card-cost">Cost: ${costs.length ? costs.map(escapeHtml).join(', ') : 'Free'}${this.arcane ? ' · Arcane' : ''}</div>
				${triggers ? `<div class="rr-card-triggers">${triggers}</div>` : '<div class="rr-card-triggers">No triggers</div>'}
			
		`
  	}
  
  renderHTML() {

		return ` 
			<div class="card">

					${this.renderDetailsHTML()}

			</div>
		`
  }
}