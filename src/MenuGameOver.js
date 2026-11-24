
export function goToGameOver() {

    document.body.replaceChildren()

    document.body.innerHTML = `

		<div id="main-menu">

            <h1 class="shadow-bg"> Game over! </h1>

		</div>

	`


}