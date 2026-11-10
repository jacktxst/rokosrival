import {capitalize} from './Helpers.js'
import * as Defs from './CardDefinitions.js' 


export function formatTarget(target) {
	return `${capitalize(target.alignment)} ${capitalize(target.kind)}`
}


export function formatCost(cost) {
	switch (cost.kind) {
		case 'payMana':
			return `${cost.amount} Mana`
		case 'payLife':
			return `${cost.amount} Life`
		case 'fizzleFriendlyNonPlayers':
			return `Fizzle ${cost.amount} Friendly non-player(s)`
		default:
			return capitalize(cost.kind)
	}
}


export function formatTrigger(trigger) {
	if (trigger.kind === 'greet') {
		return `Greet ${formatTarget(trigger.target)}`
	}
	return capitalize(trigger.kind)
}





export function formatTriggerHeader(trigger) {
  switch (trigger.kind) {
    case Defs.TRIGGER_KIND.AWAKEN:
      return "Awaken";
    case Defs.TRIGGER_KIND.REST:
      return "Rest";
    case Defs.TRIGGER_KIND.GREET:
      return `Greet ${formatTarget(trigger.target)}`;
    case Defs.TRIGGER_KIND.THORN:
      return "Thorn";
    case Defs.TRIGGER_KIND.EXIT:
      return "Exit";
    case Defs.TRIGGER_KIND.ENTRY:
      return "Entry";
    default:
      return trigger.kind;
  }
}



export function formatEffect(effect, indent) {
  switch (effect.kind) {
    case Defs.EFFECT_KIND.DEPLOY_SUBCARD:
      return `${capitalize(effect.card.type.kind)} ${effect.card.type.initialValue} {\n${formatCard(effect.card, indent + 2)}\n${" ".repeat(indent)}}`;
    case Defs.EFFECT_KIND.DESTROY:
      return `Destroy ${formatSelection(effect.selection)}`;
    case Defs.EFFECT_KIND.DRAW:
      return `${capitalize(effect.player)} Player Draw ${effect.amount}`;
    case Defs.EFFECT_KIND.DISCARD:
      return `${capitalize(effect.player)} Player Discard ${effect.amount}`;
    case Defs.EFFECT_KIND.PREDICT:
      return `${capitalize(effect.player)} Player Predict ${effect.amount}`;
    default:
      return `${capitalize(effect.kind)} ${effect.amount} ${formatSelection(effect.selection)}`;
  }
}



export function formatSelection(selection) {
  if (selection.mode === Defs.SELECTION_MODE.SELF) return "Self";
  return `${capitalize(selection.mode)} ${formatTarget(selection.target)}`;
}



export function formatCard(card, indent = 0) {
  const pad = " ".repeat(indent);
  const typeLabel = `${capitalize(card.type.kind)} ${card.type.initialValue}`;
  const costLabel = card.costs.map(formatCost).join(", ") || "Free";
  const lines = [`${pad}${typeLabel} | Cost: ${costLabel}${card.arcane ? " | Arcane" : ""}`];

  for (const trigger of card.triggers) {
    lines.push(`${pad}${formatTriggerHeader(trigger)}:`);
    for (const effect of trigger.effects) {
      lines.push(`${pad}  ${formatEffect(effect, indent + 2)}`);
    }
  }

  return lines.join("\n");
}