import { Card } from "./Card.js";
import "./CardDefinitions.js";
import { CardGame } from "./CardGame.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function resolveEffect(trigger) {

    for (let j = 0; j < trigger.effects.length; j++) {
        let targets = []
        targets = targets.concat(resolveSelection.bind(this)(trigger.effects[j]));

        for (let i = 0; i < targets.length; i++) {
            switch (trigger.effects[j].kind) {
                case "attack":
                    // Implement attack logic here
                    targets[i].health -= trigger.effects[j].amount;
                    break;
                case "heal":
                    // Implement heal logic here
                    targets[i].health += trigger.effects[j].amount;
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
        case "direct":
            // Implement direct selection logic here
            return resolveTarget.bind(this)(selection);
        case "random":
            // Implement random selection logic here
            break;
        case "twinned":
            // Implement twinned selection logic here
            break;
        case "split":
            // Implement split selection logic here
            break;
        case "self":
            return this;
        default:
            // Until selection is implemented, default to targeting opponent if not self
            // pls for the love of god delete when selection is implemented
            if (selection.mode === ["direct", "random", "twinned", "split"].includes(selection.mode)) {
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
        case "spell":
            // Implement spell target logic here
            break;
        case "construct":
            // Implement construct target logic here
            break;
        case "summon":
            // Implement summon target logic here
            break;
        case "player":
            // Implement player target logic here
            return this.opponent;
            break;
        default:
            // Until selection is implemented, default to targeting opponent if not self
            // pls for the love of god delete when selection is implemented
            if (selection.mode === ["direct", "random", "twinned", "split"].includes(selection.mode)) {
                return this.opponent;
            }
            throw new Error(`Unknown target kind: ${target.kind}`);
    }
}