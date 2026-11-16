import {capitalize} from './Helpers.js'
import {assert} from './Helpers.js'
import * as Defs from './CardDefinitions.js' 


export function formatTarget(targets) {
  // now that targets can have multiple types, we join them with commas
  //assert(targets instanceof Defs.Targets, "formatTarget requires a Targets instance");
  if(targets.alignment === Defs.ALIGNMENT.ANY) {
    return targets.types.map(capitalize).join(" or ");
  }
  return `${capitalize(targets.alignment)} ${targets.types.map(capitalize).join(" or ")}`;
}


export function formatCost(cost) {
	switch (cost.kind) {
		case 'payMana':
			return `${cost.amount} Mana`
		case 'payLife':
			return `${cost.amount} Life`
		case 'sacrifice':
			return `Sacrifice ${cost.amount} ${formatTarget(cost.targets)}s`
    case 'free':
      return "Free!";
		default:
			return capitalize(cost.kind)
	}
}


export function formatTrigger(trigger) {
	if (trigger.kind === 'greet') {
		return `Greet ${formatTarget(trigger.targets)}`
	}
  if (trigger.kind === 'grieve') {
    return `Grieve ${formatTarget(trigger.targets)}`;
  }
	return capitalize(trigger.kind)
}


export function formatTriggerHeader(trigger) {
  switch (trigger.kind) {
    case Defs.TRIGGER.AWAKEN:
      return "Awaken";
    case Defs.TRIGGER.REST:
      return "Rest";
    case Defs.TRIGGER.GREET:
      return `Greet ${formatTarget(trigger.targets)}`;
    case Defs.TRIGGER.GRIEVE:
      return "Grieve";
    case Defs.TRIGGER.THORN:
      return "Thorn";
    case Defs.TRIGGER.EXIT:
      return "Exit";
    case Defs.TRIGGER.ENTRY:
      return "Entry";
    default:
      return trigger.kind;
  }
}



export function formatEffect(effect, indent) {
  switch (effect.kind) {
    case Defs.EFFECT.DEPLOY_SUBCARD:
      return `{\n${formatCard(effect.card, indent + 2)}\n${" ".repeat(indent)}}`;
    case Defs.EFFECT.DESTROY:
      return `Destroy ${formatSelection(effect.selection)}`;
    case Defs.EFFECT.DRAW:
      return `${capitalize(effect.player)} Player Draw ${effect.amount}`;
    case Defs.EFFECT.DISCARD:
      return `${capitalize(effect.player)} Player Discard ${effect.amount}`;
    case Defs.EFFECT.PREDICT:
      return `${capitalize(effect.player)} Player Predict ${effect.amount}`;
    default:
      return `${capitalize(effect.kind)} ${effect.amount} ${formatSelection(effect.selection)}`;
  }
}



export function formatSelection(selection) {
  if (selection.kind === Defs.SELECTION.SELF) return "Self";
  return `${capitalize(selection.kind)} ${formatTarget(selection.targets)}`;
}



export function formatCard(card, indent = 0) {
  const pad = " ".repeat(indent);
  const typeLabel = `${capitalize(card.type.kind)} ${card.type.initialValue}`;
  // if a card contains the "free" cost, we omit the "Cost: " line entirely.
  const costLabel = card.costs.map(formatCost).filter(label => label !== "Free!").join(", ");
  const lines = [`${pad}${typeLabel}${costLabel ? " | Cost: " + costLabel : ""}${card.arcane ? " | Arcane" : ""}`];

  for (const trigger of card.triggers) {
    lines.push(`${pad}${formatTriggerHeader(trigger)}:`);
    for (const effect of trigger.effects) {
      lines.push(`${pad}  ${formatEffect(effect, indent + 2)}`);
    }
  }

  return lines.join("\n");
}