
import { startCardGame } from './CardGameControl.js'

export function mainMenu() {

	document.body.replaceChildren()

	document.body.innerHTML = `

		<div id="rr-menu-main">
			<div id="rr-main-title">
				Roko's Rival
			</div>
		</div>

	`

	document.getElementById("rr-main-title").addEventListener("click",(e)=>{

		startCardGame()

	})

}

