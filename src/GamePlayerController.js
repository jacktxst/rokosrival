export function p1Turn(){

	let userCardDivs = document.getElementById("rr-user-hand").children
	if (!userCardDivs) return

	for(let i=0;i<userCardDivs.length;i++) {
		userCardDivs[i].addEventListener("click",(e)=>{

			this.playCardFromHand(i)
			
		})
	}

}