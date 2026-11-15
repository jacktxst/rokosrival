// Card.js
import { CardType, TYPE } from "./CardDefinitions.js";
import {assert} from "./Helpers.js"
export class Card {

  constructor({ id, type, costs = [], arcane = false, triggers = [], owner = { kind: "inherited" } }) {
		assert(type instanceof CardType, "Card type must be a CardType instance");
		assert(typeof id === "string", "Card id must be a string");
		this.id = id;
		this.type = type;
		this.costs = costs;
		this.arcane = Boolean(arcane);
		this.triggers = triggers;
		this.owner = owner;
		
  }
}