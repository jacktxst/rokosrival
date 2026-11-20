/*

  The card library represents the entire universe of cards
  that can be seen in a playthrough. The card library is
  generated once at the beginning of a playthrough.

  The player and enemy decks are initially a random subset of 
  the card library.

*/

import { CardGenerator } from "./CardGeneratorProcedural.js";
import * as Defs from "./CardDefinitions.js";

export class CardLibrary {
  // TODO: seeding NYI
  constructor({cards = [], seed = Math.random()} = {}) {
    this.cards = cards.length > 0 ? cards : this.testCardGeneration();
    this.seed = seed;
  }

  /* Populates the card library with a specified number of cards using the given generator. */
  populateLibrary(generator, numCards) {
    let newCards = [];
    for (let i = 0; i < numCards; i++) {
      newCards.push(generator.generateCard());
    }
    return newCards;
  }

  /* Randomly chooses n cards from the existing card library to form a deck. May contain repeats. */
  getRandomDeck(n){

    let cards = [];

    for (let i=0; i<n; i++) {
      cards.push( this.cards[Math.floor(Math.random() * this.cards.length)] ) ;
    }

    return cards;

  }

  /* Generates test cards and populates the library with them. */
  testCardGeneration() {
    let newCards = [];
    const gen1 = new CardGenerator({
      idPrefix: "simple",
      maxTargetedTypes: 1,
      legalTypes: [Defs.TYPE.SPELL],
      legalTriggers: [Defs.TRIGGER.ENTRY, Defs.TRIGGER.EXIT],
      legalEffects: [Defs.EFFECT.HEAL, Defs.EFFECT.ATTACK],
    });
    const gen2 = new CardGenerator();
    const gen3 = new CardGenerator({
      idPrefix: "complex",
      maxEffectsPerTrigger: 3,
      typeValueRange: [5, 30],
      effectAmountRange: [5, 25]
    });

    newCards.push(...this.populateLibrary(gen1, 5)); // 5 simple cards
    newCards.push(...this.populateLibrary(gen2, 10)); // 10 default cards
    newCards.push(...this.populateLibrary(gen3, 3)); // 3 complex cards
    return newCards;
  }

}