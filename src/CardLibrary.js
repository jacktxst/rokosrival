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
