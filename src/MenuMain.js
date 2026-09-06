
import { startCardGame } from './CardGameControl.js'

export function mainMenu() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="rr-menu-main">
			<div id="rr-play-button">
				Play
			</div>
		</div>

	`

	document.getElementById("rr-play-button").addEventListener("click",(e)=>{

		startCardGame()

	})

}

