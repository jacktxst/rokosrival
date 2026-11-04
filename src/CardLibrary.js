import { CardGenerator } from "./CardGeneratorProcedural.js";
import { resolveEffect } from "./ResolveCardPlay.js";

export class CardLibrary {
  constructor() {
    const generator = new CardGenerator({ idPrefix: "mockup" });
    this.cards = [
      generator.buildMockupSimpleAttackSpell(),
      generator.buildMockupComplexSpell(),
    ];
  }
}

  }
}