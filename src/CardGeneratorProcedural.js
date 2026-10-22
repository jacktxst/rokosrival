// CardGeneratorProcedural.js
import { Card } from './Card.js'

export const CARD_TYPE = Object.freeze({
  SPELL: "spell",
  CONSTRUCT: "construct",
  SUMMON: "summon",
});

export const ALIGNMENT = Object.freeze({
  ANY: "any",
  FRIENDLY: "friendly",
  OPPOSING: "opposing",
});

export const TARGET_KIND = Object.freeze({
  SPELL: "spell",
  CONSTRUCT: "construct",
  SUMMON: "summon",
  PLAYER: "player",
});

export const SELECTION_MODE = Object.freeze({
  DIRECT: "direct",
  RANDOM: "random",
  TWINNED: "twinned",
  SPLIT: "split",
  SELF: "self",
});

export const TRIGGER_KIND = Object.freeze({
  AWAKEN: "awaken",
  REST: "rest",
  GREET: "greet",
  THORN: "thorn",
  EXIT: "exit",
  ENTRY: "entry",
});

export const PLAYER_REF = Object.freeze({
  FRIENDLY: "friendly",
  OPPOSING: "opposing",
  ANY: "any",
});

export const EFFECT_KIND = Object.freeze({
  ATTACK: "attack",
  HEAL: "heal",
  DEFEND: "defend",
  SURGE: "surge",
  DECAY: "decay",
  DESTROY: "destroy",
  DRAW: "draw",
  DISCARD: "discard",
  PREDICT: "predict",
  DEPLOY_SUBCARD: "deploySubcard",
});

// which targets an effect can affect.
// self is intentionally not included here so the resolver can interpret self during resolution.
const EFFECT_TARGET_RULES = Object.freeze({
  [EFFECT_KIND.ATTACK]: new Set([
    TARGET_KIND.SPELL,
    TARGET_KIND.CONSTRUCT,
    TARGET_KIND.SUMMON,
    TARGET_KIND.PLAYER,
  ]),
  [EFFECT_KIND.HEAL]: new Set([TARGET_KIND.SUMMON, TARGET_KIND.PLAYER]),
  [EFFECT_KIND.DEFEND]: new Set([
    TARGET_KIND.CONSTRUCT,
    TARGET_KIND.SUMMON,
    TARGET_KIND.PLAYER,
  ]),
  [EFFECT_KIND.SURGE]: new Set([TARGET_KIND.SPELL, TARGET_KIND.PLAYER]),
  [EFFECT_KIND.DECAY]: new Set([TARGET_KIND.SPELL]),
  [EFFECT_KIND.DESTROY]: new Set([
    TARGET_KIND.SPELL,
    TARGET_KIND.CONSTRUCT,
    TARGET_KIND.SUMMON,
    TARGET_KIND.PLAYER,
  ]),
});

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

function clampInt(value, min, max) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export class TargetSpec {
  constructor({ kind, alignment = ALIGNMENT.ANY }) {
    assert(Object.values(TARGET_KIND).includes(kind), `unknown target kind: ${kind}`);
    assert(Object.values(ALIGNMENT).includes(alignment), `unknown alignment: ${alignment}`);
    this.kind = kind;
    this.alignment = alignment;
  }

  toJSON() {
    return {
      kind: this.kind,
      alignment: this.alignment,
    };
  }
}

export class SelectionSpec {
  constructor({ mode, target = null }) {
    assert(Object.values(SELECTION_MODE).includes(mode), `unknown selection mode: ${mode}`);
    if (mode === SELECTION_MODE.SELF) {
      assert(target === null, "self selection provided a target spec (it shouldnt)");
    } else {
      assert(target instanceof TargetSpec, "non-self selection needs to provide a TargetSpec");
    }

    this.mode = mode;
    this.target = target;
  }

  toJSON() {
    return {
      mode: this.mode,
      ...(this.target ? { target: this.target.toJSON() } : {}),
    };
  }
}

export class CardTypeSpec {
  constructor({ kind, initialValue }) {
    assert(Object.values(CARD_TYPE).includes(kind), `unknown card type: ${kind}`);
    assert(Number.isInteger(initialValue) && initialValue > 0, "initialValue must be a positive integer.");

    this.kind = kind;
    this.initialValue = initialValue;
  }

  toJSON() {
    return {
      kind: this.kind,
      initialValue: this.initialValue,
    };
  }
}

export class CostSpec {
  constructor(kind, amount = null, target = null) {
    this.kind = kind;
    this.amount = amount;
    this.target = target;
  }

  static payMana(amount) {
    return new CostSpec("payMana", clampInt(amount, 0, Number.MAX_SAFE_INTEGER));
  }

  static payLife(amount) {
    return new CostSpec("payLife", clampInt(amount, 0, Number.MAX_SAFE_INTEGER));
  }

  static fizzleFriendlyNonPlayers(amount) {
    return new CostSpec(
      "fizzleFriendlyNonPlayers",
      clampInt(amount, 0, Number.MAX_SAFE_INTEGER),
      { alignment: ALIGNMENT.FRIENDLY, excludes: [TARGET_KIND.PLAYER] },
    );
  }

  toJSON() {
    return {
      kind: this.kind,
      ...(this.amount !== null ? { amount: this.amount } : {}),
      ...(this.target !== null ? { target: this.target } : {}),
    };
  }
}

export class EffectSpec {
  constructor(kind, data = {}) {
    assert(Object.values(EFFECT_KIND).includes(kind), `unknown effect: ${kind}`);
    this.kind = kind;
    Object.assign(this, data);
  }

  static targeted(kind, amount, selection) {
    assert(EFFECT_TARGET_RULES[kind], `${kind} is not a targeted effect`);
    assert(selection instanceof SelectionSpec, "targeted effects need a SelectionSpec");
    assert(Number.isInteger(amount) && amount > 0, "targeted effect amount must be positive");
    return new EffectSpec(kind, { amount, selection });
  }

  static destroy(selection) {
    assert(selection instanceof SelectionSpec, "destroy needs a SelectionSpec");
    return new EffectSpec(EFFECT_KIND.DESTROY, { selection });
  }

  static player(kind, amount, player = PLAYER_REF.FRIENDLY) {
    assert(
      [EFFECT_KIND.DRAW, EFFECT_KIND.DISCARD, EFFECT_KIND.PREDICT].includes(kind),
      `${kind} is not a player effect.`,
    );
    assert(Number.isInteger(amount) && amount > 0, "player effect amount must be positive");
    assert(Object.values(PLAYER_REF).includes(player), `unknown player: ${player}`);
    return new EffectSpec(kind, { amount, player });
  }

  static deploySubcard(card) {
    assert(card instanceof Card, "deploySubcard requires a Card instance");
    return new EffectSpec(EFFECT_KIND.DEPLOY_SUBCARD, { card });
  }

  toJSON() {
    const json = { kind: this.kind };

    if (this.amount !== undefined) json.amount = this.amount;
    if (this.selection) json.selection = this.selection.toJSON();
    if (this.player) json.player = this.player;
    if (this.card) json.card = this.card.toJSON();

    return json;
  }
}

export class TriggerSpec {
  constructor({ kind, target = null, effects = [] }) {
    assert(Object.values(TRIGGER_KIND).includes(kind), `unknown trigger kind: ${kind}`);
    if (kind === TRIGGER_KIND.GREET) {
      assert(target instanceof TargetSpec, "greet trigger must have a target spec");
    } else {
      assert(target === null, `${kind} trigger cannot have a target spec`);
    }
    assert(effects.every((effect) => effect instanceof EffectSpec), "trigger effects must be EffectSpec instances");

    this.kind = kind;
    this.target = target;
    this.effects = effects;
  }

  toJSON() {
    return {
      kind: this.kind,
      ...(this.target ? { target: this.target.toJSON() } : {}),
      effects: this.effects.map((effect) => effect.toJSON()),
    };
  }
}

// these rules define the behavior of the card types
// CardGenerator uses these to create cards with valid syntax for properties and triggers
export const CARD_TYPE_RULES = Object.freeze({
  [CARD_TYPE.SPELL]: Object.freeze({
    resource: "mana",
    fizzleAtZero: true,
    canBeDefended: false,
    canBeHealed: false,
    defaultTriggers: () => [
      new TriggerSpec({
        kind: TRIGGER_KIND.REST,
        effects: [EffectSpec.targeted(
          EFFECT_KIND.DECAY,
          1,
          new SelectionSpec({ mode: SELECTION_MODE.SELF }),
        )],
      }),
    ],
  }),
  [CARD_TYPE.CONSTRUCT]: Object.freeze({
    resource: "shield",
    fizzleAtZero: true,
    canBeDefended: true,
    canBeHealed: false,
    defaultTriggers: () => [],
  }),
  [CARD_TYPE.SUMMON]: Object.freeze({
    resource: "life",
    fizzleAtZero: true,
    canBeDefended: true,
    canBeHealed: true,
    defaultTriggers: () => [],
  }),
});

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
    const forcedType = options.forcedType ?? pick(this.rng, Object.values(CARD_TYPE));
    return this.generateCard({ depth, forcedType });
  }

  generateCard({ depth = 0, forcedType = null, subcard = false } = {}) {
    const kind = forcedType ?? pick(this.rng, Object.values(CARD_TYPE));
    const type = new CardTypeSpec({
      kind,
      initialValue: randomInt(this.rng, this.typeValueRange[0], this.typeValueRange[1]),
    });

    const costs = subcard ? [] : this.generateCosts(kind, type.initialValue);
    const arcane = subcard ? false : this.rng() < 0.25;
    const explicitTriggerCount = randomInt(this.rng, 1, 3);
    const triggers = [...CARD_TYPE_RULES[kind].defaultTriggers()];

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
      costs.push(CostSpec.payMana(Math.max(1, Math.ceil(initialValue / 2))));
    } else {
      costs.push(CostSpec.payLife(randomInt(this.rng, 1, 3)));
    }

    if (this.rng() < 0.18) {
      costs.push(CostSpec.fizzleFriendlyNonPlayers(randomInt(this.rng, 1, 2)));
    }
    return costs;
  }

  generateTrigger(depth) {
    const kind = pick(this.rng, Object.values(TRIGGER_KIND));
    const target = kind === TRIGGER_KIND.GREET ? this.generateTargetSpec() : null;
    const effectCount = randomInt(this.rng, 1, 2);
    const effects = [];

    for (let i = 0; i < effectCount; i += 1) {
      effects.push(this.generateEffect(depth));
    }

    return new TriggerSpec({ kind, target, effects });
  }

  generateEffect(depth) {
    const canCreateSubcard = depth < this.maxNestedDepth;

    const choices = [
      EFFECT_KIND.ATTACK,
      EFFECT_KIND.HEAL,
      EFFECT_KIND.DEFEND,
      EFFECT_KIND.SURGE,
      EFFECT_KIND.DECAY,
      EFFECT_KIND.DESTROY,
      EFFECT_KIND.DRAW,
      EFFECT_KIND.DISCARD,
      EFFECT_KIND.PREDICT,
    ];

    if (canCreateSubcard) choices.push(EFFECT_KIND.DEPLOY_SUBCARD);

    const kind = pick(this.rng, choices);

    if (kind === EFFECT_KIND.DEPLOY_SUBCARD) {
      return EffectSpec.deploySubcard(
        this.generateCard({
          depth: depth + 1,
          forcedType: pick(this.rng, Object.values(CARD_TYPE)),
          subcard: true,
        }),
      );
    }

    if ([EFFECT_KIND.DRAW, EFFECT_KIND.DISCARD, EFFECT_KIND.PREDICT].includes(kind)) {
      return EffectSpec.player(
        kind,
        randomInt(this.rng, this.effectAmountRange[0], this.effectAmountRange[1]),
        pick(this.rng, Object.values(PLAYER_REF)),
      );
    }

    if (kind === EFFECT_KIND.DESTROY) {
      return EffectSpec.destroy(this.generateSelectionForEffect(kind));
    }

    return EffectSpec.targeted(
      kind,
      randomInt(this.rng, this.effectAmountRange[0], this.effectAmountRange[1]),
      this.generateSelectionForEffect(kind),
    );
  }

  generateSelectionForEffect(effectKind) {
    // self is always valid because the resolver function should own the special
    // fallback behavior for effects that target themselves
    if (this.rng() < 0.15) {
      return new SelectionSpec({ mode: SELECTION_MODE.SELF });
    }

    const allowedTargetKinds = [...(EFFECT_TARGET_RULES[effectKind] ?? new Set())];
    assert(allowedTargetKinds.length > 0, `No target rules for ${effectKind}.`);

    const kind = pick(this.rng, allowedTargetKinds);
    const alignment = this.generateAlignmentForTarget(kind);
    const mode = pick(this.rng, [
      SELECTION_MODE.DIRECT,
      SELECTION_MODE.RANDOM,
      SELECTION_MODE.TWINNED,
      SELECTION_MODE.SPLIT,
    ]);

    return new SelectionSpec({
      mode,
      target: new TargetSpec({ kind, alignment }),
    });
  }

  generateTargetSpec() {
    const kind = pick(this.rng, Object.values(TARGET_KIND));
    return new TargetSpec({ kind, alignment: this.generateAlignmentForTarget(kind) });
  }

  generateAlignmentForTarget(kind) {
    if (kind === TARGET_KIND.PLAYER) {
      return pick(this.rng, [ALIGNMENT.FRIENDLY, ALIGNMENT.OPPOSING]);
    }
    return pick(this.rng, Object.values(ALIGNMENT));
  }

// regression testing simple
  buildMockupSimpleAttackSpell() {
    return new Card({
      id: this.nextId(),
      type: new CardTypeSpec({ kind: CARD_TYPE.SPELL, initialValue: 1 }),
      costs: [CostSpec.payMana(1)],
      arcane: false,
      triggers: [
        ...CARD_TYPE_RULES[CARD_TYPE.SPELL].defaultTriggers(),
        new TriggerSpec({
          kind: TRIGGER_KIND.ENTRY,
          effects: [
            EffectSpec.targeted(
              EFFECT_KIND.ATTACK,
              5,
              new SelectionSpec({
                mode: SELECTION_MODE.DIRECT,
                target: new TargetSpec({
                  kind: TARGET_KIND.PLAYER,
                  alignment: ALIGNMENT.OPPOSING,
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
      type: new CardTypeSpec({ kind: CARD_TYPE.SUMMON, initialValue: 5 }),
      costs: [],
      arcane: false,
      triggers: [
        new TriggerSpec({
          kind: TRIGGER_KIND.REST,
          effects: [
            EffectSpec.targeted(
              EFFECT_KIND.HEAL,
              2,
              new SelectionSpec({ mode: SELECTION_MODE.SELF }),
            ),
          ],
        }),
        new TriggerSpec({
          kind: TRIGGER_KIND.REST,
          effects: [
            EffectSpec.targeted(
              EFFECT_KIND.ATTACK,
              1,
              new SelectionSpec({
                mode: SELECTION_MODE.DIRECT,
                target: new TargetSpec({
                  kind: TARGET_KIND.PLAYER,
                  alignment: ALIGNMENT.OPPOSING,
                }),
              }),
            ),
          ],
        }),
      ],
    });

    return new Card({
      id: this.nextId(),
      type: new CardTypeSpec({ kind: CARD_TYPE.SPELL, initialValue: 2 }),
      costs: [CostSpec.payMana(3)],
      arcane: false,
      triggers: [
        ...CARD_TYPE_RULES[CARD_TYPE.SPELL].defaultTriggers(),
        new TriggerSpec({
          kind: TRIGGER_KIND.AWAKEN,
          effects: [EffectSpec.deploySubcard(summonedCard)],
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
    case TRIGGER_KIND.AWAKEN:
      return "Awaken";
    case TRIGGER_KIND.REST:
      return "Rest";
    case TRIGGER_KIND.GREET:
      return `Greet ${formatTarget(trigger.target)}`;
    case TRIGGER_KIND.THORN:
      return "Thorn";
    case TRIGGER_KIND.EXIT:
      return "Exit";
    case TRIGGER_KIND.ENTRY:
      return "Entry";
    default:
      return trigger.kind;
  }
}

function formatEffect(effect, indent) {
  switch (effect.kind) {
    case EFFECT_KIND.DEPLOY_SUBCARD:
      return `${capitalize(effect.card.type.kind)} ${effect.card.type.initialValue} {\n${formatCard(effect.card, indent + 2)}\n${" ".repeat(indent)}}`;
    case EFFECT_KIND.DESTROY:
      return `Destroy ${formatSelection(effect.selection)}`;
    case EFFECT_KIND.DRAW:
      return `${capitalize(effect.player)} Player Draw ${effect.amount}`;
    case EFFECT_KIND.DISCARD:
      return `${capitalize(effect.player)} Player Discard ${effect.amount}`;
    case EFFECT_KIND.PREDICT:
      return `${capitalize(effect.player)} Player Predict ${effect.amount}`;
    default:
      return `${capitalize(effect.kind)} ${effect.amount} ${formatSelection(effect.selection)}`;
  }
}

function formatSelection(selection) {
  if (selection.mode === SELECTION_MODE.SELF) return "Self";
  return `${capitalize(selection.mode)} ${formatTarget(selection.target)}`;
}

function formatTarget(target) {
  return `${capitalize(target.alignment)} ${capitalize(target.kind)}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// test
import { CardGenerator, formatCard } from "./CardGeneratorProcedural.js";
const generator = new CardGenerator();
const card = generator.generate();
console.log(card);
console.log(JSON.stringify(card.toJSON(), null, 2));
console.log(formatCard(card));
