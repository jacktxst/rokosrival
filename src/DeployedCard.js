import { Card } from './Card.js'

export class DeployedCard extends Card  {

	constructor( card , owner) {

		super( card.toJSON() )

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

}