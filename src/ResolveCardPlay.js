import Card from "./Card.js";
import "./CardDefinitions.js";
import { CardGame } from "./CardGame.js";


function resolveEffect(effect) {
    switch (effect.kind) {
        case "attack":
            // Implement attack logic here
            break;
        case "heal":
            // Implement heal logic here
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
            throw new Error(`Unknown effect kind: ${effect.kind}`);
    }
}

function resolveSelection(card) {
    selection = card.triggers.effect.selection;
    player = card.owner;
    
}