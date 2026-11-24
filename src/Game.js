
import { CardLibrary } from './CardLibrary.js'
import { CardDeck } from './CardDeck.js'
import {CardPlayerHuman} from "./CardPlayerHuman.js";
import {CardPlayerBot} from "./CardPlayerBot.js";
import {CardGame} from "./CardGame.js";
import {CardGameRenderer} from "./CardGameRenderer.js";
 

/*

	Holds the state of an entire 
	Roko's Rival game, not just 
	one match. This is the data 
	that will be saved and loaded 
	once that's implemented.

*/

export class Game {

	constructor() {

		this.init()

	}

	init() {
		this.matchNumber = 0
		this.cardLibrary  = new CardLibrary()
		this.playerDeck = new CardDeck( this.cardLibrary.getRandomDeck(50) )
	}

	beginRound() {

		let p1   = new CardPlayerHuman({ deck:this.playerDeck, name: "You"})
		let p2   = new CardPlayerBot  ({ deck:new CardDeck(this.cardLibrary.getRandomDeck(50)), name: "CPU"})
		this.cardGame = new CardGame(p1, p2)

		this.renderer = new CardGameRenderer(this.cardGame)

		this.cardGame.beginGame()

	}
}

export let game = new Game();
window.game = game;