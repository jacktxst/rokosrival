# Procedurally Generating Cards

How will this work?

When the game needs to generate a card library, like before a world starts,
it will do 

```js
let cardLibrary = new CardLibrary(seed)
```

and the `constructor` of `CardLibrary` should create an array of `CardBase` objects.  

here's how it works. we will hand write `onPlay` functions for each general kind of card behavior.
These `onPlay` functions will be called whenever the player clicks on a card or an AI decides to play a card.


However, there are some caveats here.


The `onPlay` functions are probably defined inside `CardLibrary` or some other context which
is separate from the player playing the card.

In order to ensure that the `onPlay` function can access the current player, current game, and any procedurally generated data, the caller of `onPlay`, the actual `CardPlayer`, attaches itself to the `onPlay` function as such: 
```js
this.played_card = i
this.hand[i].onPlay.bind(this)()
```
`i` is the hand index of the played card.

calling `.bind(this)` makes it so you can refer to the `CardPlayer` as `this` inside of `onPlay`

so, you can write stuff like this:

```js
onPlay() {
	this.opponent.health -= 10
}
```

and `this` will refer to the `CardPlayer` who played the card, even though `onPlay` is not defined within that class.

additionally, because the `CardPlayer` set their `played_card`, we can also access procedurally generated data which has been attached to the `CardBase` like so:

```js
onPlay() {
	this.opponent.health = this.hand[this.played_card].generatedDamageValue
}
```
