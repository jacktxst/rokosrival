export class GameRNG {
	constructor(seed) {
		this.seed = seed
		this.state = 0
	}

	/**
	 * Converts the seed string to a numeric value for use in the LCG algorithm
	 */
	_seedToNumber() {
		let hash = 0
		for (let i = 0; i < this.seed.length; i++) {
			const char = this.seed.charCodeAt(i)
			hash = ((hash << 5) - hash) + char
			hash = hash & hash
		}
		return Math.abs(hash)
	}

	/**
	 * Linear Congruential Generator - produces a decimal between 0 and 1
	 */
	rng() {
		const seedNum = this._seedToNumber()
		const a = 1664525
		const c = 1013904223
		const m = 2 ** 32
		const x = (a * (seedNum + this.state) + c) % m
		this.state++
		return (x / m) >>> 0 / m
	}

	/**
	 * Generates a new random seed string (12 characters, 0-9 and A-Z)
	 */
	rngSeed() {
		const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
		let newSeed = ''
		for (let i = 0; i < 12; i++) {
			const randomIndex = Math.floor(this.rng() * chars.length)
			newSeed += chars[randomIndex]
		}
		return newSeed
	}

	/**
	 * Returns a random integer between int1 and int2 (inclusive)
	 */
	rngInt(int1, int2) {
		const min = Math.min(int1, int2)
		const max = Math.max(int1, int2)
		return Math.floor(this.rng() * (max - min + 1)) + min
	}

	/**
	 * Returns a subset of the provided array with a random number of elements
	 * maxSubset: maximum number of elements in the returned subset (default: 1)
	 */
	rngPick(array, maxSubset = 1) {
		if (!array || array.length === 0) {
			return []
		}

		const max = Math.min(maxSubset, array.length)
		const subsetSize = this.rngInt(1, max)
		
		const shuffled = [...array]
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(this.rng() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
		}
		
		return shuffled.slice(0, subsetSize)
	}
}
