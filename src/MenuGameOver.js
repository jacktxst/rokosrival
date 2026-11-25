import {goToLobby} from "./MenuLobby.js";
import {goToMainMenu} from "./MenuMain.js";

export function loseGame() {

    document.body.replaceChildren()

    document.body.innerHTML = `

		<div id="main-menu">

            <h1 class="shadow-bg"> You lost! </h1>
            
            <div id="main-menu-button" class="stone-button">
				Return To Main Menu
			</div>

		</div>

	`

    document.getElementById("main-menu-button").addEventListener("click",(e)=>{
        goToMainMenu();
    })
}

export function winGame() {
    game.matchNumber++;
    document.body.replaceChildren()

    document.body.innerHTML = `

		<div id="main-menu">

            <h1 class="shadow-bg"> You won! </h1>
            
            <div id="continue-button" class="stone-button">
				Continue
			</div>

		</div>

	`

    document.getElementById("continue-button").addEventListener("click",(e)=>{
        goToLobby();
    })
}