import { CardTypeSpec, CostSpec, TriggerSpec } from "./CardDefinitions.js";
import { capitalize, escapeHtml } from './Helpers.js'
import { formatCost, formatTrigger, formatCard, formatEffect } from './CardFormatHelpers.js'

import { assert } from './Helpers.js'

export class Card {

  constructor({ id, type, costs = [], arcane = false, triggers = [], owner = { kind: "inherited" } }) {
	
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

  toJSON() {
		return {
		  id: this.id, // this needs to copy the string, it currently doesnt
		  type: this.type.toJSON(),
		  costs: this.costs.map((cost) => cost.toJSON()),
		  arcane: this.arcane,
		  owner: this.owner,
		  triggers: this.triggers.map((trigger) => trigger.toJSON()),
		};
  }

  renderDetailsHTML() {
  	const title = `${capitalize(this.type.kind)} (${this.isDeployed ? this.getHeaderNumber() : this.type.initialValue})`
		const costs = this.costs.map(formatCost)
		const triggers = this.triggers.map((trigger) => `
			<div>	
				<details>
					<summary> <strong>${escapeHtml(formatTrigger(trigger))}</strong> </summary>
					${trigger.effects.length
						? `<ul>${trigger.effects.map((effect) => `
							<li> 
								${effect.kind === 'deploySubcard'
									? `Deploy ${escapeHtml(capitalize(effect.card.type.kind))} ${effect.card.type.initialValue}${effect.card.renderDetailsHTML()}`
									: escapeHtml(formatEffect(effect))}
							</li>
						`).join('')}</ul>`
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
			<div class="rr-card">

					${this.renderDetailsHTML()}

			</div>
		`
  }
}