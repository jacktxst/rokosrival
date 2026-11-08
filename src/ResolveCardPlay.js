import { Card } from "./Card.js";
import "./CardDefinitions.js";
import { CardGame } from "./CardGame.js";

import { assert } from "./Helpers.js"


export function triggerCard(card, triggerKind) {

    for (let trigger of card.triggers) {
            if (trigger.kind === triggerKind) {
                
                for (let effect of trigger.effects) {

                    if (  ["direct","split","twinned"].includes( effect.selection.mode )  ) {





                    }

                }



            }
        }


}