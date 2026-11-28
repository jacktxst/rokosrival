

export function setupCheats() {

    for (let button of document.getElementsByClassName("cheat-button")) {
        button.style.display = "inline";
    }

    for (let card of [...document.getElementById("player-hand").children, ...document.getElementById("opponent-hand").children]  ) {

        for (let trigger of card.children[2].children) {
            if (trigger.tagName.toLowerCase() === "button") {

            } else {
                let deleteButton = trigger.children[0].children[0].children[0];
                deleteButton.addEventListener("click", () => {
                    card.triggers = card.triggers.splice(card.triggers.indexOf(trigger), 1);
                    window.game.renderer.renderBoard()
                })
            }
        }

    }


}