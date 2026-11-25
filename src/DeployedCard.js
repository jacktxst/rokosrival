import { Card } from './Card.js'
import {eventQueue, TriggerCardEvent} from "./ResolveCardPlay.js";

export class DeployedCard extends Card  {

	constructor( card , owner) {

		super( card.getData() )

		this.owner  = owner
		this.health = 0
		this.mana   = 0
		this.shield = 0
		this.isDeployed = true

		switch (this.type.kind) {

			case "construct":
				this.shield = this.type.initialValue
				break;
			case "summon":
				this.health = this.type.initialValue
				break;
			case "spell":
				this.mana   = this.type.initialValue
				break;

		}

	}

	getHeaderNumber() {

		switch (this.type.kind) {

			case "construct":
				return this.shield;
				break;
			case "summon":
				return this.health;
				break;
			case "spell":
				return this.mana;
				break;

		}

	}

	attack(attacker, damage) {
		if (this.shield !== 0) { // got a weird error message: cant read .shield from undefined
			if (this.shield < damage) {
				damage -= this.shield
				this.shield = 0
			} else {
				this.shield -= damage
				damage = 0
			}
		}
		this.health -= damage
		if (this.type.kind === 'construct' && this.shield <= 0) {

			this.fizzle()

		}
		else if (this.health <= 0) {
			this.fizzle()
		}
		eventQueue.splice(1, 0, new TriggerCardEvent(this, "thorn", attacker) )

	}

	fizzle(){
		this.owner.activeCards = this.owner.activeCards.filter(item => item !== this)
		eventQueue.splice(1,0,new TriggerCardEvent(this, "exit"))

		if (!this.isSubcard) {
			this.owner.discard.placeCards([this])
		}

		for (let card of [...this.owner.activeCards, ...this.owner.opponent.activeCards]) {
			eventQueue.splice(1,0,new TriggerCardEvent( card, "grieve", this ))
		}
	}

}