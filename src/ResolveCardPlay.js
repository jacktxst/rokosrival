import { Card } from "./Card.js";
import "./CardDefinitions.js";
import { CardGame } from "./CardGame.js";

import { assert } from "./Helpers.js"

/* 
    at the callsite, 'this' should be set to the owner player
*/
export function resolveEffect(trigger) {

    for (let effect of trigger.effects) {


        let targets = []

        targets = targets.concat(resolveSelection.bind(this)(effect));

        for (let target of targets) {
            switch (effect.kind) {
                case "attack":
                    // Implement attack logic here
                    target.health -= effect.amount;
                    break;
                case "heal":
                    // Implement heal logic here
                    target.health += effect.amount;
                    break;
                case "defend":
                    // Implement defend logic here
                    break;
                case "surge":
                    // Implement surge logic here
                    break;
                case "decay":
                    // Implement decay logic here
                    break;
                case "destroy":
                    // Implement destroy logic here
                    break;
                case "draw":
                    // Implement draw logic here
                    break;
                case "discard":
                    // Implement discard logic here
                    break;
                case "predict":
                    // Implement predict logic here
                    break;
                case "deploySubcard":
                    // Implement deploySubcard logic here
                    break;
                default:
                    throw new Error(`Unknown effect kind: ${trigger.effects[j].kind}`);
            }
        }
    }
}

function resolveSelection(effect) {
    let selection = effect.selection

    //need to handle player input for everything that isnt self and random iirc
    //and need to be able to read cards currently in play to process summons and constructs instead of always targeting the other player
    switch (selection.mode) {
        /*case "direct":
            // Implement direct selection logic here
        case "random":
            // Implement random selection logic here
        case "twinned":
            // Implement twinned selection logic here
        case "split":
            // Implement split selection logic here*/
        case "self":
            return this; // this is the CardPlayer
        default:
            // Until selection is implemented, default to targeting opponent if not self
            // pls for the love of god delete when selection is implemented
            if (["direct", "random", "twinned", "split"].includes(selection.mode)) {
                return resolveTarget.bind(this)(selection);
            }
            throw new Error(`Unknown selection mode: ${selection.mode}`);
    }
}

function resolveTarget(selection) {
    assert(selection.mode !== "self", "Self-targeting should be handled by the resolver, not the target-kind list.");
    let target = selection.target

    // Still need to figure out how to handle alignment without excess complexity
    switch (target.kind) {
        /*case "spell":
            // Implement spell target logic here
        case "construct":
            // Implement construct target logic here
        case "summon":
            // Implement summon target logic here
        case "player":*/
            // Implement player target logic here
        default:
            // Until selection is implemented, default to targeting opponent if not self
            // pls for the love of god delete when selection is implemented
            if (["spell", "construct", "summon", "player"].includes(target.kind)) {
                if (target.alignment !== 'friendly') {
                    return this.opponent;
                } else { return this }
            }
            throw new Error(`Unknown target kind: ${target.kind}`);
    }
}