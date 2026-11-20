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

  // generates a unique ID for each card, optionally with a suffix
  // the ID is composed of the idPrefix, a zero-padded sequence number, and the optional suffix
  nextId(suffix = "") {
    this.sequence += 1;
    return `${this.idPrefix}-${String(this.sequence).padStart(4, "0")}${suffix}`;
  }

  generateCard(options = {}) {
    const depth = options.depth ?? 0; // if depth is not provided, default to 0
    assert(depth <= this.maxNestedDepth, "depth exceeds maxNestedDepth");
    const type = new Defs.CardType({
      kind: options.forcedType ?? pick(this.seed, [Defs.TYPE.SPELL, Defs.TYPE.SUMMON, Defs.TYPE.CONSTRUCT]),
      initialValue: randomInt(this.seed, this.typeValueRange[0], this.typeValueRange[1]),
    });

    const costs = options.depth > 0 ? [] : this.generateCosts(type.kind, type.initialValue);
    const arcane = options.depth > 0 ? false : this.seed() < 0.25;
    const triggers = [];
    // generate a random number of triggers for the card.
    // subcards generate with fewer triggers to avoid excessive complexity
    const triggerCount = randomInt(this.seed, 1, 3 - depth);
    for (let i = 0; i < triggerCount; i += 1) {
      triggers.push(this.generateTrigger({ depth }));
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
  generateTargets( { legalTypes, legalAlignments = [Defs.ALIGNMENT.ANY] } = {}) {
    // if legalAlignments is provided, pick an alignment from that list. otherwise, alignment defaults to ANY.
    const alignment = pick(this.seed, legalAlignments);
    const typeChoices = legalTypes ?? Object.values(Defs.TYPE);
    const types = [];
    const targetTypeCount = randomInt(this.seed, 1, typeChoices.length);
    types.push(pick(this.seed, typeChoices, targetTypeCount));
    
    return new Defs.Targets({ types, alignment });
  }

  generateSelectionForEffect(effectKind) {
    // self is always valid because the resolver function should own the card
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
      targets: this.generateTargets({ legalTypes: allowedTypes, legalAlignments: allowedAlignmentKinds }),
    });
  } 

  generateEffect({depth = 0, legalEffects = []} = {}) {

    const defaultLegalEffects = [
      Defs.EFFECT.ATTACK, 
      Defs.EFFECT.HEAL, 
      Defs.EFFECT.DEFEND, 
      Defs.EFFECT.SURGE, 
      Defs.EFFECT.DECAY, 
      Defs.EFFECT.DESTROY, 
      Defs.EFFECT.DRAW, 
      Defs.EFFECT.DISCARD, 
      // Defs.EFFECT.PREDICT
    ];

    // if legal effects not provided, default to the above list
    if (legalEffects.length === 0) {
      legalEffects = defaultLegalEffects;
     if (depth === 0) {
       // if legal effects not provided AND we are at the top level (depth 0), include DEPLOY_SUBCARD as a default legal effect
       legalEffects.push(Defs.EFFECT.DEPLOY_SUBCARD);
     }
    }

    // pick which effect
    const kind = pick(this.seed, legalEffects);
    const value = randomInt(this.seed, this.effectAmountRange[0], this.effectAmountRange[1]);
    if(kind === Defs.EFFECT.DEPLOY_SUBCARD) {
      return Defs.Effect.deploySubcard(
        this.generateCard({
          depth: depth + 1,
        }),
      );
    }
    print("generating effect of kind: ", kind, " with value: ", value);
    const selection = this.generateSelectionForEffect(kind);
    return new Defs.Effect(kind, value, selection);
  }

  // a trigger is a collection of effects that are executed when the trigger condition is met.
  // a card can have multiple triggers, and each trigger can have multiple effects.
  // the trigger kind determines when the trigger is activated, and the effects determine what happens when the trigger is activated.
  // triggers should be able to generate with multiple valid targets
  generateTrigger({ depth = 0, legalTriggers = [], legalEffects = [] } = {}) {
    
    const legalTypes = [Defs.TYPE.SPELL, Defs.TYPE.SUMMON, Defs.TYPE.CONSTRUCT];
    const targets = this.generateTargets( {legalTypes} );
    // if legalTriggers is provided, pick a trigger kind from that list. otherwise, pick a trigger kind from the full list of trigger kinds.
    const triggerKind = legalTriggers.length > 0 ? pick(this.seed, legalTriggers) : pick(this.seed, Object.values(Defs.TRIGGER));


    const effectCount = randomInt(this.seed, 1, legalEffects.length);
    const effects = [];

    for (let i = 0; i < effectCount; i += 1) {
      const newEffect = this.generateEffect({ depth, legalEffects });
      // remove the kind of the newly generated effect from the list of legal effects 
      // to avoid duplicate effect kinds within the same trigger
      legalEffects = legalEffects.filter(e => e !== newEffect.kind);
      effects.push(newEffect);
    }

    return new Defs.Trigger({ kind: triggerKind, targets, effects });
  }



// regression testing simple
  buildMockupSimpleAttackSpell() {
    return new Card({
      id: this.nextId(),
      type: new Defs.CardType({ kind: Defs.TYPE.SPELL, initialValue: 1 }),
      costs: [Defs.Cost.payMana(1)],
      arcane: false,
      triggers: [
        new Defs.Trigger({
          kind: Defs.TRIGGER.ENTRY,
          effects: [
            new Defs.Effect(
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
            new Defs.Effect(
              Defs.EFFECT.HEAL, //kind
              2, //amount
              new Defs.Selection({ kind: Defs.SELECTION.SELF }), //selection
            ),
          ],
        }),
        new Defs.Trigger({
          kind: Defs.TRIGGER.REST,
          effects: [
            new Defs.Effect(
              Defs.EFFECT.ATTACK, //kind
              1, // amount
              new Defs.Selection({ // selection
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
          effects: [
            new Defs.Effect.deploySubcard(summonedCard)],
        }),
      ],
    });
  }
}







