import {goToMainMenu} from "./MenuMain.js";

export function goToCreateMultiplayerGame() {

    let ready=false;

    document.body.replaceChildren()

    document.body.innerHTML = `

		<div id="create-multiplayer-game">

			<div id="exit-button" class="stone-button">
				Exit To Main Menu
			</div> 
            
            <h1 class="shadow-bg"> Your name... </h1>
            
            <h1 class="shadow-bg"> Current server: None 
                
                <div id="ip-button" class="stone-button">
				Enter Server IP
			    </div> 
                
            </h1>
            
            <h1 class="shadow-bg"> Finding a room... </h1>
            
			<div id="ready-button" class="stone-button">
				Ready
			</div> 
			
			<h1 class="shadow-bg"> Rules </h1>

			<h1 class="shadow-bg"> Players </h1>
			
		</div>

	`

    document.getElementById("exit-button").addEventListener("click",(e)=>{

        goToMainMenu()

    })

    document.getElementById("ready-button").addEventListener("click", (e)=>{
        ready = !ready;
        if(ready){
            document.getElementById("ready-button").innerHTML = "Unready"
        } else {
            document.getElementById("ready-button").innerHTML = "Ready"
        }
    });


}