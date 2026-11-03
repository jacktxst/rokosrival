


/*

	Holds the state of an entire Roko's Rival game, not just one match. 
	This is the data that will be saved and loaded.

*/
export class GameState {

	constructor() {

		this.matchNumber = 0
		this.currentState = ""
		this.cardLibrary  = null


	}
}

export let gameState = new GameState();