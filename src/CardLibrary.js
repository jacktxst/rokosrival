import { CardGenerator } from "./CardGeneratorProcedural.js";

export class CardLibrary {
  constructor() {
    const generator = new CardGenerator({ idPrefix: "mockup" });
    this.cards = [
      generator.buildMockupSimpleAttackSpell(),
      generator.buildMockupComplexSpell(),
    ];
  }
}

function onPlay() {
  for (trigger in this.played_card.triggers) {
    if (trigger === "entry") {
      resolveEffect.bind(this)(trigger);
    }
  }
}