import {capitalize} from './Helpers.js'
import {assert} from './Helpers.js'
import * as Defs from './CardDefinitions.js' 


export function formatTargets(targets) {
  // omit alignment if it is "any"
  const alignmentStr = targets.alignment === Defs.ALIGNMENT.ANY ? "" : targets.alignment;

  let typeStr;
  if(targets.types.length > 1) {
    // if there are multiple types, join them with commas and "or" before the last one
    typeStr = targets.types.slice(0, -1).join(", ") + " or " + targets.types[targets.types.length - 1];
  } else {
    if(targets.types[0] === "any") {
      typeStr = "card";
    }
    typeStr = targets.types[0];
  }

  return `${alignmentStr}${alignmentStr ? " " : ""}${typeStr}`;
}


export function formatCost(cost) {
	switch (cost.kind) {
		case 'payMana':
			return `${cost.amount} Mana`
		case 'payLife':
			return `${cost.amount} Life`
		case 'sacrifice':
			return `Sacrifice ${cost.amount} ${formatTargets(cost.targets)}s`
    case 'free':
      return "Free!"
		default:
			return cost.kind
	}
}


export function formatTrigger(trigger) {
  // only Greet and Grieve have targets, so don't format targets for other triggers
	return `${capitalize(trigger.kind)}${trigger.targets ? " " + formatTargets(trigger.targets) + "s" : ""}`;
}



export function formatEffect(effect) {
  if(effect.kind === Defs.EFFECT.DEPLOY_SUBCARD) {
    return `Deploy a ${capitalize(effect.card.type.kind)} subcard`;
  }
  const selectionStr = formatSelection(effect.selection);
  switch (effect.kind) {
    case Defs.EFFECT.ATTACK:
      return `Deal ${effect.amount} damage ${selectionStr}`;

    case Defs.EFFECT.DRAW:
      if(effect.selection.kind !== Defs.SELECTION.SELF) {
        // if amount is 1, use "a card", otherwise use "n cards"
        return `${selectionStr} draws ${effect.amount === 1 ? "a" : effect.amount} ${effect.amount === 1 ? "card" : "cards"}`;
      }
      // if selection is self, "You draw ..." instead of "<selection> draws ..."
      return `You draw ${effect.amount === 1 ? "a" : effect.amount} ${effect.amount === 1 ? "card" : "cards"}`;

    case Defs.EFFECT.DISCARD:
      if(effect.selection.kind !== Defs.SELECTION.SELF) {
        return `${selectionStr} discards ${effect.amount === 1 ? "a" : effect.amount} ${effect.amount === 1 ? "card" : "cards"}`;
      }
      return `You discard ${effect.amount === 1 ? "a" : effect.amount} ${effect.amount === 1 ? "card" : "cards"}`;
    case Defs.EFFECT.DEFEND:
      return `Apply ${effect.amount} shield ${selectionStr}`;
    case Defs.EFFECT.HEAL:
      return `Heal ${effect.amount} life ${selectionStr}`;
    default:
      return `${capitalize(effect.kind)}s ${effect.amount} ${selectionStr}`;
  }
  // TODO add formatting for other effect kinds that may not require an amount, like DESTROY -Loid
}



export function formatSelection(selection) {
  if(selection.kind === Defs.SELECTION.SELF) {
    return "to itself";
  }
  const targetStr = formatTargets(selection.targets);
  switch (selection.kind) {
    case Defs.SELECTION.DIRECT:
      return `to target ${targetStr}`;
    case Defs.SELECTION.EACH:
      return `to each ${targetStr}`;
    case Defs.SELECTION.RANDOM:
      return `to a random ${targetStr}`;
    case Defs.SELECTION.SPLIT:
      return `divided equally among each chosen ${targetStr}`;
    default:
      return `${capitalize(selection.kind)} ${targetStr}`;
  }
}



export function formatCard(card) {
  const pad = " ";
  const typeLabel = `${capitalize(card.type.kind)} ${card.type.initialValue}`;
  // if a card contains the "free" cost, we omit the "Cost: " line entirely.
  const costLabel = card.costs.map(formatCost).filter(label => label !== "Free!").join(", ");
  const lines = [`${pad}${typeLabel}${costLabel ? " | Cost: " + costLabel : ""}${card.arcane ? " | Arcane" : ""}`];

  for (const trigger of card.triggers) {
    lines.push(`${pad}${formatTrigger(trigger)}:`);
    for (const effect of trigger.effects) {
      lines.push(`${pad}  ${formatEffect(effect)}`);
    }
  }
  return lines.join("\n");
}