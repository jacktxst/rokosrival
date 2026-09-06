

# Rendering of the Board

The game board is "rendered" to be made out of HTML DOM elements that are created from JavaScript.

index.html is mostly empty because all the HTML content of the game is stored inside .js files.

How do we "render" the board?

Javascript allows you to do something like this:

```js
document.body.innerHTML = `<div> any html content here </div>`
```

# Key UI Concept

The backtick-enclosed string is called a template literal. We can insert 
Javascript expressions into the HTML string using a feature of the template 
literal. Template literals allow you to create strings which contain
JS-generated content by enclosing javascript expressions in `${ javascript goes here... }`.
So, everytime we want to update the UI, we just update the appropriate element's `innerHTML`
property with a really long backtick-enclosed template literal that can contain dynamic javascript
generated content.

# Frameworkless Rendering

To make multi-page complex, reactive, stateful user interfaces, most developers reach for a framework such as React, Vue, or something else. I'm trying to make the point with this project that those frameworks aren't very necessary and can sometimes box you in and make things a bit more difficult when you're working on a smaller-scale project or don't need to make changes in production.


Here's a useful example of a snippet of a template string which can generate multiple repeated HTML elements by appending HTML to a string and returning the finished string as the result of a self-calling lambda function. I'm particularly proud of figuring this one out.

```js

`
<div class="rr-hand-container" id="rr-opp-hand">
	${(()=>{
		let string = ""
		for (let i=0;i<this.opponent.hand.length;i++) {
			string += `
				<div class="rr-card rr-card-backside"></div>
			`
		}
		return string
	})()}
</div>
`

```

# Animation

CSS animations, requestAnimationFrame, and setTimeout

# Rendering Code

ALl the rendering code for the card game lives in ViewCardGame.js