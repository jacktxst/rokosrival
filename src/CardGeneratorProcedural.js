// CardGeneratorProcedural.js
import { Card } from "./Card.js";
import * as CardDefinitions from "./CardDefinitions.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick(rng, array) {
  assert(array.length > 0, "can't pick from an empty array.");
  return array[randomInt(rng, 0, array.length - 1)];
}

export class CardGenerator {
  constructor({
    rng = Math.random,
    idPrefix = "card",
    maxNestedDepth = 2,
    typeValueRange = [1, 7],
    effectAmountRange = [1, 6],
  } = {}) {
    assert(typeof rng === "function", "rng must be between 0 and 1");
    assert(maxNestedDepth >= 0, "maxNestedDepth must be >= 0");

    this.rng = rng;
    this.idPrefix = idPrefix;
    this.maxNestedDepth = maxNestedDepth;
    this.typeValueRange = typeValueRange;
    this.effectAmountRange = effectAmountRange;
    this.sequence = 0;
  }

  nextId(suffix = "") {
    this.sequence += 1;
    return `${this.idPrefix}-${String(this.sequence).padStart(4, "0")}${suffix}`;
  }

  generate(options = {}) {
    const depth = options.depth ?? 0;
    const forcedType = options.forcedType ?? pick(this.rng, Object.values(CardDefinitions.CARD_TYPE));
    return this.generateCard({ depth, forcedType });
  }

  generateCard({ depth = 0, forcedType = null, subcard = false } = {}) {
    const kind = forcedType ?? pick(this.rng, Object.values(CardDefinitions.CARD_TYPE));
    const type = new CardDefinitions.CardTypeSpec({
      kind,
      initialValue: randomInt(this.rng, this.typeValueRange[0], this.typeValueRange[1]),
    });

    const costs = subcard ? [] : this.generateCosts(kind, type.initialValue);
    const arcane = subcard ? false : this.rng() < 0.25;
    const explicitTriggerCount = randomInt(this.rng, 1, 3);
    const triggers = [...CardDefinitions.CARD_TYPE_RULES[kind].defaultTriggers()];

    for (let i = 0; i < explicitTriggerCount; i += 1) {
      triggers.push(this.generateTrigger(depth));
    }

    return new Card({
      id: this.nextId(),
      type,
      costs,
      arcane,
      triggers,
    });
  }

  generateCosts(kind, initialValue) {
    const costs = [];
    // non-subcards must require at least one cost
    if (this.rng() < 0.8) {
      costs.push(CardDefinitions.CostSpec.payMana(Math.max(1, Math.ceil(initialValue / 2))));
    } else {
      costs.push(CardDefinitions.CostSpec.payLife(randomInt(this.rng, 1, 3)));
    }

    if (this.rng() < 0.18) {
      costs.push(CardDefinitions.CostSpec.fizzleFriendlyNonPlayers(randomInt(this.rng, 1, 2)));
    }
    return costs;
  }

  generateTrigger(depth) {
    const kind = pick(this.rng, Object.values(CardDefinitions.TRIGGER_KIND));
    const target = kind === CardDefinitions.TRIGGER_KIND.GREET ? this.generateTargetSpec() : null;
    const effectCount = randomInt(this.rng, 1, 2);
    const effects = [];

    for (let i = 0; i < effectCount; i += 1) {
      effects.push(this.generateEffect(depth));
    }

    return new CardDefinitions.TriggerSpec({ kind, target, effects });
  }

  generateEffect(depth) {
    const canCreateSubcard = depth < this.maxNestedDepth;

    const choices = [
      CardDefinitions.EFFECT_KIND.ATTACK,
      CardDefinitions.EFFECT_KIND.HEAL,
      CardDefinitions.EFFECT_KIND.DEFEND,
      CardDefinitions.EFFECT_KIND.SURGE,
      CardDefinitions.EFFECT_KIND.DECAY,
      CardDefinitions.EFFECT_KIND.DESTROY,
      CardDefinitions.EFFECT_KIND.DRAW,
      CardDefinitions.EFFECT_KIND.DISCARD,
      CardDefinitions.EFFECT_KIND.PREDICT,
    ];

    if (canCreateSubcard) choices.push(CardDefinitions.EFFECT_KIND.DEPLOY_SUBCARD);

    const kind = pick(this.rng, choices);

    if (kind === CardDefinitions.EFFECT_KIND.DEPLOY_SUBCARD) {
      return CardDefinitions.EffectSpec.deploySubcard(
        this.generateCard({
          depth: depth + 1,
          forcedType: pick(this.rng, Object.values(CardDefinitions.CARD_TYPE)),
          subcard: true,
        }),
      );
    }

    if ([CardDefinitions.EFFECT_KIND.DRAW, CardDefinitions.EFFECT_KIND.DISCARD, CardDefinitions.EFFECT_KIND.PREDICT].includes(kind)) {
      return CardDefinitions.EffectSpec.player(
        kind,
        randomInt(this.rng, this.effectAmountRange[0], this.effectAmountRange[1]),
        pick(this.rng, Object.values(CardDefinitions.PLAYER_REF)),
      );
    }

    if (kind === CardDefinitions.EFFECT_KIND.DESTROY) {
      return CardDefinitions.EffectSpec.destroy(this.generateSelectionForEffect(kind));
    }

    return CardDefinitions.EffectSpec.targeted(
      kind,
      randomInt(this.rng, this.effectAmountRange[0], this.effectAmountRange[1]),
      this.generateSelectionForEffect(kind),
    );
  }

  generateSelectionForEffect(effectKind) {
    // self is always valid because the resolver function should own the special
    // fallback behavior for effects that target themselves
    if (this.rng() < 0.15) {
      return new CardDefinitions.SelectionSpec({ mode: CardDefinitions.SELECTION_MODE.SELF });
    }

    const allowedTargetKinds = [...(CardDefinitions.EFFECT_TARGET_RULES[effectKind] ?? new Set())];
    assert(allowedTargetKinds.length > 0, `No target rules for ${effectKind}.`);

    const kind = pick(this.rng, allowedTargetKinds);
    const alignment = this.generateAlignmentForTarget(kind);
    const mode = pick(this.rng, [
      CardDefinitions.SELECTION_MODE.DIRECT,
      CardDefinitions.SELECTION_MODE.RANDOM,
      CardDefinitions.SELECTION_MODE.TWINNED,
      CardDefinitions.SELECTION_MODE.SPLIT,
    ]);

    return new CardDefinitions.SelectionSpec({
      mode,
      target: new CardDefinitions.TargetSpec({ kind, alignment }),
    });
  }

  generateTargetSpec() {
    const kind = pick(this.rng, Object.values(CardDefinitions.TARGET_KIND));
    return new CardDefinitions.TargetSpec({ kind, alignment: this.generateAlignmentForTarget(kind) });
  }

  generateAlignmentForTarget(kind) {
    if (kind === CardDefinitions.TARGET_KIND.PLAYER) {
      return pick(this.rng, [CardDefinitions.ALIGNMENT.FRIENDLY, CardDefinitions.ALIGNMENT.OPPOSING]);
    }
    return pick(this.rng, Object.values(CardDefinitions.ALIGNMENT));
  }

// regression testing simple
  buildMockupSimpleAttackSpell() {
    return new Card({
      id: this.nextId(),
      type: new CardDefinitions.CardTypeSpec({ kind: CardDefinitions.CARD_TYPE.SPELL, initialValue: 1 }),
      costs: [CardDefinitions.CostSpec.payMana(1)],
      arcane: false,
      triggers: [
        ...CardDefinitions.CARD_TYPE_RULES[CardDefinitions.CARD_TYPE.SPELL].defaultTriggers(),
        new CardDefinitions.TriggerSpec({
          kind: CardDefinitions.TRIGGER_KIND.ENTRY,
          effects: [
            CardDefinitions.EffectSpec.targeted(
              CardDefinitions.EFFECT_KIND.ATTACK,
              5,
              new CardDefinitions.SelectionSpec({
                mode: CardDefinitions.SELECTION_MODE.DIRECT,
                target: new CardDefinitions.TargetSpec({
                  kind: CardDefinitions.TARGET_KIND.PLAYER,
                  alignment: CardDefinitions.ALIGNMENT.OPPOSING,
                }),
              }),
            ),
          ],
        }),
      ],
    });
  }

// regression testing complex
  buildMockupComplexSpell() {
    const summonedCard = new Card({
      id: this.nextId("-sub"),
      type: new CardDefinitions.CardTypeSpec({ kind: CardDefinitions.CARD_TYPE.SUMMON, initialValue: 5 }),
      costs: [],
      arcane: false,
      triggers: [
        new CardDefinitions.TriggerSpec({
          kind: CardDefinitions.TRIGGER_KIND.REST,
          effects: [
            CardDefinitions.EffectSpec.targeted(
              CardDefinitions.EFFECT_KIND.HEAL,
              2,
              new CardDefinitions.SelectionSpec({ mode: CardDefinitions.SELECTION_MODE.SELF }),
            ),
          ],
        }),
        new CardDefinitions.TriggerSpec({
          kind: CardDefinitions.TRIGGER_KIND.REST,
          effects: [
            CardDefinitions.EffectSpec.targeted(
              CardDefinitions.EFFECT_KIND.ATTACK,
              1,
              new CardDefinitions.SelectionSpec({
                mode: CardDefinitions.SELECTION_MODE.DIRECT,
                target: new CardDefinitions.TargetSpec({
                  kind: CardDefinitions.TARGET_KIND.PLAYER,
                  alignment: CardDefinitions.ALIGNMENT.OPPOSING,
                }),
              }),
            ),
          ],
        }),
      ],
    });

    return new Card({
      id: this.nextId(),
      type: new CardDefinitions.CardTypeSpec({ kind: CardDefinitions.CARD_TYPE.SPELL, initialValue: 2 }),
      costs: [CardDefinitions.CostSpec.payMana(3)],
      arcane: false,
      triggers: [
        ...CardDefinitions.CARD_TYPE_RULES[CardDefinitions.CARD_TYPE.SPELL].defaultTriggers(),
        new CardDefinitions.TriggerSpec({
          kind: CardDefinitions.TRIGGER_KIND.AWAKEN,
          effects: [CardDefinitions.EffectSpec.deploySubcard(summonedCard)],
        }),
      ],
    });
  }
}

// this is just a stub for the time being.
// cards will be resolved in the game loop, not in the generator.
export class GameStateResolver {
  constructor() {
    this.cardsInPlay = [];
  }

  playCard(card) {
    throw new Error(
      "NYI",
    );
  }

  step(_stepName) {
    throw new Error(
      "NYI",
    );
  }
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

function formatCost(cost) {
  switch (cost.kind) {
    case "payMana":
      return `${cost.amount} Mana`;
    case "payLife":
      return `${cost.amount} Life`;
    case "fizzleFriendlyNonPlayers":
      return `Fizzle ${cost.amount} Friendly non-player(s)`;
    default:
      return cost.kind;
  }
}

function formatTriggerHeader(trigger) {
  switch (trigger.kind) {
    case CardDefinitions.TRIGGER_KIND.AWAKEN:
      return "Awaken";
    case CardDefinitions.TRIGGER_KIND.REST:
      return "Rest";
    case CardDefinitions.TRIGGER_KIND.GREET:
      return `Greet ${formatTarget(trigger.target)}`;
    case CardDefinitions.TRIGGER_KIND.THORN:
      return "Thorn";
    case CardDefinitions.TRIGGER_KIND.EXIT:
      return "Exit";
    case CardDefinitions.TRIGGER_KIND.ENTRY:
      return "Entry";
    default:
      return trigger.kind;
  }
}

function formatEffect(effect, indent) {
  switch (effect.kind) {
    case CardDefinitions.EFFECT_KIND.DEPLOY_SUBCARD:
      return `${capitalize(effect.card.type.kind)} ${effect.card.type.initialValue} {\n${formatCard(effect.card, indent + 2)}\n${" ".repeat(indent)}}`;
    case CardDefinitions.EFFECT_KIND.DESTROY:
      return `Destroy ${formatSelection(effect.selection)}`;
    case CardDefinitions.EFFECT_KIND.DRAW:
      return `${capitalize(effect.player)} Player Draw ${effect.amount}`;
    case CardDefinitions.EFFECT_KIND.DISCARD:
      return `${capitalize(effect.player)} Player Discard ${effect.amount}`;
    case CardDefinitions.EFFECT_KIND.PREDICT:
      return `${capitalize(effect.player)} Player Predict ${effect.amount}`;
    default:
      return `${capitalize(effect.kind)} ${effect.amount} ${formatSelection(effect.selection)}`;
  }
}

function formatSelection(selection) {
  if (selection.mode === CardDefinitions.SELECTION_MODE.SELF) return "Self";
  return `${capitalize(selection.mode)} ${formatTarget(selection.target)}`;
}

function formatTarget(target) {
  return `${capitalize(target.alignment)} ${capitalize(target.kind)}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
