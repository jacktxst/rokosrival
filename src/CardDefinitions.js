import { Card } from "./Card.js";

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

// Self-targeting is handled by the resolver rather than this target-kind list.
export const EFFECT_TARGET_RULES = Object.freeze({
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
