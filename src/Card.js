export class Card {
  constructor({ id, type, costs = [], arcane = false, triggers = [], owner = { kind: "inherited" } }) {
	assert(typeof id === "string" && id.length > 0, "id must exist and not be empty lol");
	assert(type instanceof CardTypeSpec, "card type must be a CardTypeSpec");
	assert(costs.every((cost) => cost instanceof CostSpec), "card costs must be CostSpec instances");
	assert(triggers.every((trigger) => trigger instanceof TriggerSpec), "card triggers must be TriggerSpec instances");

	this.id = id;
	this.type = type;
	this.costs = costs;
	this.arcane = Boolean(arcane);
	this.triggers = triggers;
	this.owner = owner;
  }

  toJSON() {
	return {
	  id: this.id,
	  type: this.type.toJSON(),
	  costs: this.costs.map((cost) => cost.toJSON()),
	  arcane: this.arcane,
	  owner: this.owner,
	  triggers: this.triggers.map((trigger) => trigger.toJSON()),
	};
  }
}