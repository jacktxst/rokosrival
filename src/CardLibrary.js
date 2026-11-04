import { CardGenerator } from "./CardGeneratorProcedural.js";
import { resolveEffect } from "./ResolveCardPlay.js";

export class CardLibrary {
  constructor() {
    const generator = new CardGenerator({ idPrefix: "mockup" });
    const gen2 = new CardGenerator({effectAmountRange: [1,1]})
    this.cards = [
      generator.buildMockupSimpleAttackSpell()
    ];

    for (let i = 0; i < 25; i++) {
      this.cards.push(gen2.generateCard({forcedType:'spell', forcedTrigger:'entry', forcedEffects:['attack']}));
    }

    for (let i = 0; i < 10; i++) {
      this.cards.push(gen2.generateCard({forcedType:'spell', forcedTrigger:'entry', forcedEffects:['heal']}));
    }
  }
}