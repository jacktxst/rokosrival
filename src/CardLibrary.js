/*

  The card library represents the entire universe of cards
  that can be seen in a playthrough. The card library is
  generated once at the beginning of a playthrough.

  The player and enemy decks are initially a random subset of 
  the card library.

*/

import { CardGenerator } from "./CardGeneratorProcedural.js";
import { resolveEffect } from "./ResolveCardPlay.js";

export class CardLibrary {
  constructor() {
    const generator = new CardGenerator({ idPrefix: "mockup" });
    const gen2 = new CardGenerator({effectAmountRange: [1,1]})
    this.cards = [
      generator.buildMockupSimpleAttackSpell()
    ];

    for (let i = 0; i < 40; i++) {
      this.cards.push(gen2.generateCard({forcedType:'spell', forcedTrigger:'entry', forcedEffects:['attack']}));
    }

    for (let i = 0; i < 20; i++) {
      this.cards.push(gen2.generateCard({forcedType:'spell', forcedTrigger:'entry', forcedEffects:['heal']}));
    }
  }

  /* generates a random deck with n cards. may contain repeats. */
  getRandomDeck(n){

    let cards = [];

    for (let i=0; i<n; i++) {
      cards.push( this.cards[Math.floor(Math.random() * this.cards.length)] ) ;
    }

    return cards;

  }

}