// CardGeneratorProcedural.js
import { Card } from "./Card.js";
import * as Defs from "./CardDefinitions.js";
import {assert, randomInt, pick, capitalize} from "./Helpers.js"
export class CardGenerator {
  // example usage:
  // const myGenerator1 = new CardGenerator({ idPrefix: "basic", seed: 0.67 });
  constructor({
    seed = Math.random, // seed between 0 and 1. can be replaced with a seeded RNG for reproducibility
    idPrefix = "card", // allows you to determine which generator created the card. useful for debugging
    maxNestedDepth = 2, // maximum depth of nested subcards
    typeValueRange = [1, 7], // initial value range for card types. used to determine the initial value of a card type when generating a new card
    effectAmountRange = [1, 6], // amount range for effects. used to determine the amount of an effect when generating a new effect
  } = {}) {
    assert(typeof seed === "function", "seed must be between 0 and 1");
    assert(maxNestedDepth >= 0, "maxNestedDepth must be >= 0");

    this.seed = seed;
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

  generateCard(options = {}) {
    const depth = options.depth ?? 0; // if depth is not provided, default to 0
    assert(depth <= this.maxNestedDepth, "depth exceeds maxNestedDepth");

    const type = new Defs.CardType({
      kind: options.forcedType ?? pick(this.seed, Object.values(Defs.TYPE)),
      initialValue: randomInt(this.seed, this.typeValueRange[0], this.typeValueRange[1]),
    });

    const costs = options.subcard ? [] : this.generateCosts(type.kind, type.initialValue);
    const arcane = options.subcard ? false : this.seed() < 0.25;
    const explicitTriggerCount = 1 ? options.forcedTrigger : randomInt(this.seed, 1, 3);
    const triggers = [];

    for (let i = 0; i < explicitTriggerCount; i += 1) {
      triggers.push(this.generateTrigger({depth:depth}));
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
    if (this.seed() < 0.8) {
      costs.push(Defs.Cost.payMana(Math.max(1, Math.ceil(initialValue / 2))));
    } else {
      costs.push(Defs.Cost.payLife(randomInt(this.seed, 1, 3)));
    }
    if (this.seed() < 0.18) {
      costs.push(Defs.Cost.paySacrifice(randomInt(this.seed, 1, 2), )); // fizzle friendly non player cards
    }
    return costs;
  }

  // generates a "Target" object used to describe which card type(s) of which alignments are valid targets 
  // used when generating both effects AND triggers.
  generateTargets( { legalTypes, legalAlignments } = {}) {
    // if legalAlignments is provided, pick an alignment from that list. otherwise, alignment defaults to ANY.
    const alignment = legalAlignments ? pick(this.seed, legalAlignments) : [Defs.ALIGNMENT.ANY];
    const typeChoices = legalTypes ?? Object.values(Defs.TYPE);
    const types = [];
    const targetTypeCount = randomInt(this.seed, 1, legalTypes.length);
    types.push(pick(this.seed, typeChoices, targetTypeCount));
    
    return new Defs.Targets({ types, alignment });
  }

  generateSelectionForEffect(effectKind) {
    // self is always valid because the resolver function should own the ial
    // fallback behavior for effects that target themselves
    if (this.seed() < 0.4) {
      return new Defs.Selection({ kind: Defs.SELECTION.SELF });
    }

    // CardDefinitions.js describes which effect kinds can target which card types, and which selection kinds are valid for each effect kind.
    // constructs a Set of allowed alignment kinds for the given effect kind, or an empty Set if none are specified. 
    // The spread operator is used to convert the Set into an array for easier manipulation.
    const allowedTypes = [...(Defs.EFFECT_TARGET_RULES[effectKind] ?? new Set())];
    const allowedSelectionKinds = [...(Defs.EFFECT_SELECTION_RULES[effectKind] ?? new Set())];
    const allowedAlignmentKinds = [...(Defs.EFFECT_ALIGNMENT_RULES[effectKind] ?? new Set())];

    return new Defs.Selection({
      kind: pick(this.seed, allowedSelectionKinds),
      targets: this.generateTargets(allowedTypes, allowedAlignmentKinds),
    });
  } 

  generateEffect({depth = 0, forcedEffect = null} = {}) {
    const canCreateSubcard = depth < this.maxNestedDepth;

    const choices = [
      Defs.EFFECT.ATTACK,
      Defs.EFFECT.HEAL,
      //Defs.EFFECT.DEFEND,
      //Defs.EFFECT.SURGE,
      //Defs.EFFECT.DECAY,
      //Defs.EFFECT.DESTROY,
      //Defs.EFFECT.DRAW,
      //Defs.EFFECT.DISCARD,
      //Defs.EFFECT.PREDICT,
    ];

    if (canCreateSubcard) choices.push(Defs.EFFECT.DEPLOY_SUBCARD);

    const kind = forcedEffect ?? pick(this.seed, choices);

    if (kind === Defs.EFFECT.DEPLOY_SUBCARD) {
      return Defs.Effect.deploySubcard(
        this.generateCard({
          depth: depth + 1,
          forcedType: pick(this.seed, Object.values(Defs.TYPE)),
          subcard: true,
        }),
      );
    }

    if ([Defs.EFFECT.DRAW, Defs.EFFECT.DISCARD, Defs.EFFECT.PREDICT].includes(kind)) {
      return Defs.Effect.player(
        kind,
        randomInt(this.seed, this.effectAmountRange[0], this.effectAmountRange[1]),
        pick(this.seed, Object.values(Defs.PLAYER_REF)),
      );
    }

    if (kind === Defs.EFFECT.DESTROY) {
      return Defs.Effect.destroy(this.generateSelectionForEffect(kind));
    }

    return Defs.Effect.targeted(
      kind,
      randomInt(this.seed, this.effectAmountRange[0], this.effectAmountRange[1]),
      this.generateSelectionForEffect(kind),
    );
  }

  // a trigger is a collection of effects that are executed when the trigger condition is met.
  // a card can have multiple triggers, and each trigger can have multiple effects.
  // the trigger kind determines when the trigger is activated, and the effects determine what happens when the trigger is activated.
  // triggers should be able to generate with multiple valid targets
  generateTrigger({ depth = 0, legalTriggers = null, legalEffects = [] } = {}) {
    
    // if legalTriggers is provided, pick a trigger kind from that list. otherwise, pick a trigger kind from the full list of trigger kinds.
    const triggerKind = legalTriggers ? pick(this.seed, legalTriggers) : pick(this.seed, Object.values(Defs.TRIGGER));

    // player is not a valid target type for triggers, so we exclude it here
    const legalTypes = [Defs.TYPE.SPELL, Defs.TYPE.SUMMON, Defs.TYPE.CONSTRUCT];
    const targets = this.generateTargets( {legalTypes} );


    const effectCount = randomInt(this.seed, 1, 2);
    const effects = [];
    for (let i =  0; i < effectCount; i += 1) {
      effects.push(this.generateEffect({depth:depth}));
    }

    return new Defs.Trigger({ triggerKind, targets, effects });
  }



// regression testing simple
  buildMockupSimpleAttackSpell() {
    return new Card({
      id: this.nextId(),
      type: new Defs.CardType({ kind: Defs.TYPE.SPELL, initialValue: 1 }),
      costs: [Defs.Cost.payMana(1)],
      arcane: false,
      triggers: [
        ...Defs.CARD_TYPE_RULES[Defs.TYPE.SPELL].defaultTriggers(),
        new Defs.Trigger({
          kind: Defs.TRIGGER.ENTRY,
          effects: [
            Defs.Effect.targeted(
              Defs.EFFECT.ATTACK,
              5,
              new Defs.Selection({
                kind: Defs.SELECTION.DIRECT,
                targets: new Defs.Targets({
                  types: [Defs.TYPE.PLAYER, Defs.TYPE.SUMMON],
                  alignment: Defs.ALIGNMENT.OPPOSING,
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
      type: new Defs.CardType({ kind: Defs.TYPE.SUMMON, initialValue: 5 }),
      costs: [],
      arcane: false,
      triggers: [
        new Defs.Trigger({
          kind: Defs.TRIGGER.REST,
          effects: [
            Defs.Effect.targeted(
              Defs.EFFECT.HEAL,
              2,
              new Defs.Selection({ kind: Defs.SELECTION.SELF }),
            ),
          ],
        }),
        new Defs.Trigger({
          kind: Defs.TRIGGER.REST,
          effects: [
            Defs.Effect.targeted(
              Defs.EFFECT.ATTACK,
              1,
              new Defs.Selection({
                kind: Defs.SELECTION.DIRECT,
                targets: new Defs.Targets({
                  types: [Defs.TYPE.PLAYER],
                  alignment: Defs.ALIGNMENT.OPPOSING,
                }),
              }),
            ),
          ],
        }),
      ],
    });

    return new Card({
      id: this.nextId(),
      type: new Defs.CardType({ kind: Defs.TYPE.SPELL, initialValue: 2 }),
      costs: [Defs.Cost.payMana(3)],
      arcane: false,
      triggers: [
        ...Defs.CARD_TYPE_RULES[Defs.TYPE.SPELL].defaultTriggers(),
        new Defs.Trigger({
          kind: Defs.TRIGGER.AWAKEN,
          effects: [Defs.Effect.deploySubcard(summonedCard)],
        }),
      ],
    });
  }
}







