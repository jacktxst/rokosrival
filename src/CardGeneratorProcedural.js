// CardGeneratorProcedural.js
import { Card } from "./Card.js";
import * as Defs from "./CardDefinitions.js";
import {assert, randomInt, pick, insist} from "./Helpers.js"

export class CardGenerator {
  constructor({
    // random number generator function, should return a number between 0 and 1.
    // for reproducible randomness, pass a custom RNG function.
    rngFunction = Math.random, // TODO: allow seeding for reproducible randomness
    seed = 0, // seed for reproducible randomness, currently not used
    idPrefix = "default", // allows you to determine which generator created the card. useful for debugging
    maxNestedDepth = 2, // maximum depth of nested subcards
    typeValueRange = [1, 7], // initial value range for card types. used to determine the initial value of a card type when generating a new card
    effectAmountRange = [1, 6], // amount range for effects. used to determine the amount of an effect when generating a new effect
    maxTargetedTypes = 3, // maximum number of different card types that can be generated for a target
    maxEffectsPerTrigger = 1, // maximum number of effects per trigger
    legalTypes = [Defs.TYPE.CONSTRUCT, Defs.TYPE.SPELL, Defs.TYPE.SUMMON], // by default, avoid generating Players lol
    legalTriggers = Object.values(Defs.TRIGGER),
    legalEffects = Object.values(Defs.EFFECT),
  } = {}) {

    // options initialization
    this.rngFunction = rngFunction; // function returning a number between 0 and 1
    this.seed = seed; // currently not used
    this.idPrefix = idPrefix;
    this.maxNestedDepth = maxNestedDepth;
    this.typeValueRange = typeValueRange;
    this.effectAmountRange = effectAmountRange;
    this.maxTargetedTypes = maxTargetedTypes;
    this.maxEffectsPerTrigger = maxEffectsPerTrigger;
    this.legalTypes = legalTypes;
    this.legalTriggers = legalTriggers;
    this.legalEffects = legalEffects;

    assert(this.legalTypes && this.legalTypes.length > 0, "At least one legal type must be defined");

    // initialize sequence for unique IDs
    this.sequence = 0; 
  }

  // generates a unique ID for each card, optionally with a suffix
  // the ID is composed of the idPrefix, a zero-padded sequence number, and the optional suffix
  nextId(suffix = "") {
    this.sequence += 1;
    return `${this.idPrefix}-${String(this.sequence).padStart(4, "0")}${suffix}`;
  }

  generateCard(depth = 0) {
    assert(depth <= this.maxNestedDepth, `Exceeded max nested depth: ${depth} > ${this.maxNestedDepth}`);
    assert(Array.isArray(this.legalTypes), "legalTypes must be an array");
    assert(this.legalTypes.length > 0, "Tried to generate a card, but no legal types were defined");
    assert(Array.isArray(this.legalTriggers), "legalTriggers must be an array");
    assert(this.legalTriggers.length > 0, "Tried to generate a card, but no legal triggers were defined");
    assert(Array.isArray(this.legalEffects), "legalEffects must be an array");
    assert(this.legalEffects.length > 0, "Tried to generate a card, but no legal effects were defined");
    // double check that each legal type is valid
    this.legalTypes.forEach(typeKind => {
      assert(Object.values(Defs.TYPE).includes(typeKind), `Legal type kind was invalid: "${typeKind}"`);
    });

    let typeInitialValue = randomInt(this.rngFunction, this.typeValueRange[0], this.typeValueRange[1]);

    // pick a type kind from the legal types
    // since pick returns an array, we take the first element as the chosen type kind
    let typeKind = pick(this.legalTypes, 1, this.rngFunction);
    assert(typeKind.length === 1, `Expected exactly one type kind to be picked, got: "${typeKind}"`);
    typeKind = typeKind[0];
    assert(Object.values(Defs.TYPE).includes(typeKind), `Chosen type kind was invalid: "${typeKind}"`);
    
    const type = new Defs.CardType({
      kind: typeKind,
      initialValue: typeInitialValue,
    });

    const costs = depth > 0 ? [] : this.generateCosts(typeInitialValue);
    const arcane = depth > 0 ? false : this.rngFunction() < 0.25;


    // construct a list of which trigger types this card will have from among the legal triggers.
    let triggerTypes = pick(this.legalTriggers, this.maxEffectsPerTrigger - depth, this.rngFunction);

    // double check that each chosen trigger type is a valid kind
    triggerTypes.forEach(triggerKind => {
      assert(Object.values(Defs.TRIGGER).includes(triggerKind), `Chosen trigger kind was invalid: "${triggerKind}"`);
    });

    // for each chosen trigger type, generate a corresponding Trigger object.
    let triggers = [];
    triggerTypes.forEach(triggerKind => triggers.push(this.generateTrigger(triggerKind, depth)));

    return new Card({
      id: this.nextId(),
      type,
      costs,
      arcane,
      triggers,
    });
  }

  generateCosts(initialValue) {
    let costs = [];
    if (this.rngFunction() < 0.8) {
      costs.push(Defs.Cost.payMana(Math.max(1, Math.ceil(initialValue / 2))));
    } else {
      costs.push(Defs.Cost.payLife(randomInt(this.rngFunction, 1, 3)));
    }
    if (this.rngFunction() < 0.18) {
      costs.push(Defs.Cost.paySacrifice(randomInt(this.rngFunction, 1, 2), )); // fizzle friendly non player cards
    }
    return costs;
  }

  // generates a "Targets" object used to describe which card type(s) of which alignments are valid targets 
  // used when generating both effects AND triggers.
  generateTargets(effectKind) {
    assert(Object.values(Defs.EFFECT).includes(effectKind) || Object.values(Defs.TRIGGER).includes(effectKind), `Tried to generate targets for unknown effect/trigger kind: "${effectKind}"`);
    
    // Pick expects an array, but TARGET_RULES is a set
    const types = pick(Array.from(Defs.TARGET_RULES[effectKind]), this.maxTargetedTypes, this.rngFunction);
    const alignment = pick([Defs.ALIGNMENT.ANY, Defs.ALIGNMENT.FRIENDLY, Defs.ALIGNMENT.OPPOSING], 1, this.rngFunction)[0];
    return new Defs.Targets({ types, alignment });
  }

      // CardDefinitions.js describes which selection kinds are valid for each effect kind.
  generateSelection(effectKind, selectionKind) {
    assert(Object.values(Defs.SELECTION).includes(selectionKind), `Tried to generate selection of unknown kind: "${selectionKind}"`);
    return new Defs.Selection({
      kind: selectionKind,
      targets: this.generateTargets(effectKind),
    });
  } 

  generateEffect(kind, depth = 0) {
    assert(Object.values(Defs.EFFECT).includes(kind), `Tried to generate effect of unknown kind: "${kind}"`);
    if(kind === Defs.EFFECT.DEPLOY_SUBCARD) {
      let subcard = this.generateCard(depth + 1);
      return Defs.Effect.deploySubcard(
        subcard
      );
    }
    const value = randomInt(this.rngFunction, this.effectAmountRange[0], this.effectAmountRange[1]);
    const selection = this.generateSelection(kind, Defs.SELECTION.DIRECT);
    return new Defs.Effect(kind, value, selection);
  }

  // a trigger is a collection of effects that are executed when the trigger condition is met.
  // a card can have multiple triggers, and each trigger can have multiple effects.
  // the trigger kind determines when the trigger is activated, and the effects determine what happens when the trigger is activated.
  // triggers should be able to generate with multiple valid targets
  generateTrigger(kind, depth = 0) {
    assert(Object.values(Defs.TRIGGER).includes(kind), `Tried to generate trigger of unknown kind: "${kind}"`);

    // local copy:
    let possibleEffectKinds = [...this.legalEffects];
    assert(possibleEffectKinds.length > 0, "No possible effect kinds available for trigger generation");
    // ensure that depth is within the allowed max nested depth
    // if it isn't, we need to remove DEPLOY_SUBCARD from the possible effect kinds
    if(depth >= this.maxNestedDepth) {
      possibleEffectKinds = possibleEffectKinds.filter(effectKind => effectKind !== Defs.EFFECT.DEPLOY_SUBCARD);
    }

    const effectArray = pick(possibleEffectKinds, this.maxEffectsPerTrigger, this.rngFunction).map(effectKind => this.generateEffect(effectKind, depth));
    
    if(kind === Defs.TRIGGER.GREET || kind === Defs.TRIGGER.GRIEVE || kind === Defs.TRIGGER.THORN) {
      return new Defs.Trigger({
        kind, 
        effects: effectArray, 
        targets: this.generateTargets(kind)});
    }
    return new Defs.Trigger({kind, effects: effectArray});
  }
}