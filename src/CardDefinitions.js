// CardDefinitions.js
import { Card } from "./Card.js";
import { assert, insist } from "./Helpers.js"
import { clampInt } from "./Helpers.js"

// valid card types
export const TYPE = Object.freeze({
  SPELL: "spell",
  CONSTRUCT: "construct",
  SUMMON: "summon",
  PLAYER: "player",
});

export const COST = Object.freeze({
  PAY_MANA: "payMana",
  PAY_LIFE: "payLife",
  PAY_SACRIFICE: "paySacrifice",
  FREE: "free",
});

// friendly/opposing is relative to the card's owner.
export const ALIGNMENT = Object.freeze({
  ANY: "any",
  FRIENDLY: "friendly",
  OPPOSING: "opposing",
});

export const SELECTION = Object.freeze({
  DIRECT: "specified",  // exactly one target from among Targets is selected by the player (or AI) and affected by the effect
  RANDOM: "random",     // exactly one target from among Targets is randomly selected
  EACH: "each",         // each of the valid Targets are all affected by the effect (same amount is applied to each)
  SPLIT: "split among", // one or more targets from among Targets must be selected, and the effect amount is split among them (rounded down)
  SELF: "self",         // the card itself is the target, no selection needed. Refers to the owner of the card in the case of SPELLs.
});

export const TRIGGER = Object.freeze({
  AWAKEN: "awaken",   // triggers at the start of your turn
  REST: "rest",       // triggers at the end of your turn
  ENTRY: "entry",     // triggers when this card is deployed
  EXIT: "exit",       // triggers when this card fizzles
  GREET: "greet",     // triggers whenever another [TARGET] is deployed
  GRIEVE: "grieve",   // triggers whenever another [TARGET] fizzles (is moved from the field to the discard pile)
  THORN: "thorn",     // triggers whenever another [TARGET] applies an effect to this card (e.g. ATTACK, HEAL, DEFEND, SURGE, DECAY)
});

export const EFFECT = Object.freeze({
  ATTACK: "attack",
  HEAL: "heal",
  DEFEND: "defend",
  SURGE: "surge",
  DECAY: "decay",
  DESTROY: "destroy",
  DRAW: "draw",
  DISCARD: "discard",
//  PREDICT: "predict", // too complex to implement right now, but could be added later
  DEPLOY_SUBCARD: "deploySubcard",
});

// valid targets for each effect (and also for Triggers since some Triggers require targets)
// Self-targeting is handled by the resolver rather than this target-kind list.
export const TARGET_RULES = Object.freeze({
  [TRIGGER.GREET]: new Set([
    TYPE.CONSTRUCT,
    TYPE.SUMMON,
    TYPE.SPELL,
  ]),
  [TRIGGER.GRIEVE]: new Set([
    TYPE.CONSTRUCT,
    TYPE.SUMMON,
    TYPE.SPELL,
  ]),
  [TRIGGER.THORN]: new Set([
    TYPE.CONSTRUCT,
    TYPE.SUMMON,
    TYPE.SPELL,
  ]),
  
  [EFFECT.ATTACK]: new Set([
    TYPE.CONSTRUCT,
    TYPE.SUMMON,
    TYPE.PLAYER,
  ]),
  [EFFECT.HEAL]: new Set([
    TYPE.SUMMON, 
    TYPE.PLAYER
  ]),
  [EFFECT.DEFEND]: new Set([
    TYPE.CONSTRUCT,
    TYPE.SUMMON,
    TYPE.PLAYER,
  ]),
  [EFFECT.DESTROY]: new Set([
    TYPE.SPELL,
    TYPE.CONSTRUCT,
    TYPE.SUMMON,
    TYPE.PLAYER,
  ]),
  [EFFECT.SURGE]: new Set([
    TYPE.SPELL, 
    TYPE.PLAYER
  ]),
  [EFFECT.DECAY]: new Set(
    [TYPE.SPELL, 
    TYPE.PLAYER
  ]),
  [EFFECT.DRAW]: new Set([TYPE.PLAYER]),
  [EFFECT.DISCARD]: new Set([TYPE.PLAYER]),
  // predict is not implemented yet, but if it were, it would only target players
  // [EFFECT.PREDICT]: new Set([TYPE.PLAYER]),
});

// determines what alignment is an upside for each effect. 
// for example, ATTACK -> OPPOSING and ATTACK -> ANY are considered beneficial effects
// meanwhile ATTACK -> FRIENDLY is not listed here because it would be considered a detrimental effect.
export const EFFECT_ALIGNMENT_RULES = Object.freeze({
  [EFFECT.ATTACK]: new Set([ALIGNMENT.ANY, ALIGNMENT.OPPOSING]),
  [EFFECT.HEAL]: new Set([ALIGNMENT.ANY, ALIGNMENT.FRIENDLY]),
  [EFFECT.DEFEND]: new Set([ALIGNMENT.ANY, ALIGNMENT.FRIENDLY]),
  [EFFECT.SURGE]: new Set([ALIGNMENT.ANY, ALIGNMENT.FRIENDLY]),
  [EFFECT.DECAY]: new Set([ALIGNMENT.ANY, ALIGNMENT.OPPOSING]),
  [EFFECT.DESTROY]: new Set([ALIGNMENT.ANY, ALIGNMENT.OPPOSING]),
  [EFFECT.DRAW]: new Set([ALIGNMENT.ANY, ALIGNMENT.FRIENDLY]),
  [EFFECT.DISCARD]: new Set([ALIGNMENT.ANY, ALIGNMENT.OPPOSING]),
  // [EFFECT.PREDICT]: new Set([ALIGNMENT.ANY, ALIGNMENT.FRIENDLY, ALIGNMENT.OPPOSING]),
});

export const EFFECT_SELECTION_RULES = Object.freeze({
  [EFFECT.ATTACK]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH, SELECTION.SPLIT]),
  [EFFECT.HEAL]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH, SELECTION.SPLIT]),
  [EFFECT.DEFEND]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH, SELECTION.SPLIT]),
  [EFFECT.SURGE]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH]),
  [EFFECT.DECAY]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH]),
  [EFFECT.DESTROY]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH]),
  [EFFECT.DRAW]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH]),
  [EFFECT.DISCARD]: new Set([SELECTION.DIRECT, SELECTION.RANDOM, SELECTION.EACH]),
  // [EFFECT.PREDICT]: new Set([SELECTION.DIRECT]),
});

export class Targets {
  constructor({ types, alignment = ALIGNMENT.ANY }) {
    assert(Array.isArray(types), `tried to assemble Targets from a ${typeof types}; expected an Array of Types but got ${types}`);
    this.types = types;

    // ensure the alignment is valid
    // throw a warning and default to ANY if not
    this.alignment = insist(Object.values(ALIGNMENT).includes(alignment), `assembling Targets for an unknown alignment "${alignment}"; defaulting to ANY`) ? alignment : ALIGNMENT.ANY;
  }
}

export class Selection {
  constructor({ kind, targets = null }) {
    //assert(Object.values(SELECTION).includes(kind), `unknown selection mode: ${kind}`);
    if (kind === SELECTION.SELF) {
      //assert(targets === null, "self selection provided Targets (it shouldnt do that)");
    } else {
      //assert(targets instanceof Targets, "non-self selection failed to provide Targets");
    }

    this.kind = kind;
    this.targets = targets;
  }
}

export class CardType {
  constructor({ kind, initialValue }) {
    //assert(Object.values(TYPE).includes(kind), `unknown card type: ${kind}`);
    //assert(Number.isInteger(initialValue) && initialValue > 0, "initialValue must be a positive integer.");

    this.kind = kind;
    this.initialValue = initialValue;
  }

}

export class Cost {
  constructor(kind, amount = null, targets = null) {
    this.kind = kind;
    this.amount = amount;
    this.targets = targets;
  }

  static payMana(amount) {
    return new Cost("payMana", clampInt(amount, 0, Number.MAX_SAFE_INTEGER));
  }

  static payLife(amount) {
    return new Cost("payLife", clampInt(amount, 0, Number.MAX_SAFE_INTEGER));
  }

  static paySacrifice(amount) {
    return new Cost(
      "Sacrifice",
      clampInt(amount, 0, Number.MAX_SAFE_INTEGER),
      new Targets({ types: [TYPE.SUMMON, TYPE.CONSTRUCT, TYPE.SPELL], alignment: ALIGNMENT.FRIENDLY }),
    );
  }
}

export class Effect {
  constructor(effectKind, amount, selection = null) {
    // TODO Destroy effect doesn't require an amount, unlike other effects. -Loid
    // consequently, it ALSO shouldn't be able to generate with the SPLIT selection kind.
    assert(Object.values(EFFECT).includes(effectKind), `unknown effect kind in Effect constructor: ${effectKind}`);
    assert(Number.isInteger(amount), "Effect amount must be an integer");
    this.kind = effectKind;
    this.amount = amount;
    this.selection = selection;
  }

  static deploySubcard(card) {
    const effect = new Effect(EFFECT.DEPLOY_SUBCARD, card.type.initialValue);
    effect.card = card;
    return effect;
  }
}

export class Trigger {
  constructor({ kind, effects, targets = null}) {
    assert(Object.values(TRIGGER).includes(kind), `Tried to assemble trigger with unknown Trigger kind: "${kind}"`);
    assert(Array.isArray(effects), `Tried to assemble ${kind} Trigger with non-array effects`);
    insist(effects.length > 0, `Assembling ${kind} Trigger with zero effects`);

    if (kind === TRIGGER.GREET || kind === TRIGGER.GRIEVE || kind === TRIGGER.THORN) {
      insist(targets !== null, `Assembling ${kind} Trigger with missing Targets`);
      this.targets = targets;
    } else {
      insist(targets === null, `Ignoring unnecessary Targets when assembling ${kind} Trigger: ${JSON.stringify(targets)}`);
    }
    this.kind = kind;
    this.effects = effects;
  }
}

export const CARD_TYPE_RULES = Object.freeze({
  [TYPE.SPELL]: Object.freeze({
    resource: "mana",
    fizzleAtZero: true,
    canBeDefended: false,
    canBeHealed: false,
  }),
  [TYPE.CONSTRUCT]: Object.freeze({
    resource: "shield",
    fizzleAtZero: true,
    canBeDefended: true,
    canBeHealed: false,
  }),
  [TYPE.SUMMON]: Object.freeze({
    resource: "life",
    fizzleAtZero: true,
    canBeDefended: true,
    canBeHealed: true,
  }),
});
