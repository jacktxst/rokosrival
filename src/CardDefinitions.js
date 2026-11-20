// CardDefinitions.js
import { Card } from "./Card.js";
import { assert } from "./Helpers.js"
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

// valid targets for each effect
// Self-targeting is handled by the resolver rather than this target-kind list.
export const EFFECT_TARGET_RULES = Object.freeze({
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
    // validate that each target type is a valid TYPE
    //assert(Array.isArray(types), "types provided is not in the form of an array");
    //assert(types.length > 0, "types array is empty");
    //assert(types.every((type) => Object.values(TYPE).includes(type)), "types array contains invalid card Types: " + types.filter((type) => !Object.values(TYPE).includes(type)).join(", "));
    //assert(Object.values(ALIGNMENT).includes(alignment), `tried to target an unknown alignment: ${alignment}`);
    this.types = types;
    this.alignment = alignment;
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
  constructor({ kind, targets = null, effects = [] }) {
    //assert(Object.values(TRIGGER).includes(kind), `unknown trigger kind: ${kind}`);
    //assert(targets === null || targets instanceof Targets, `${kind} Trigger targets must be a Targets instance or null`);
    //assert(effects.every((effect) => effect instanceof Effect), `${kind} Trigger effects must be Effect instances`);

    if (kind === TRIGGER.GREET || kind === TRIGGER.GRIEVE || kind === TRIGGER.THORN) {
      assert(targets !== null, `${kind} Trigger failed to provide Targets`);
      this.targets = targets;
    } else {
      assert(targets === null, `${kind} Trigger provided unnecessary Targets: ${JSON.stringify(targets)}`);
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
