export class SeedableRandom {
	// Linear congruential generator
	private seed: number;

	constructor(seed: number) {
		this.seed = seed;
	}

	next() {
		// Returns random float in [0, 1)
		const a = 1664525;
		const c = 1013904223;
		const m = 2 ** 32;
		this.seed = (a * this.seed + c) % m;
		return this.seed / m;
	}

	setSeed(seed: number) {
		this.seed = seed;
	}
}
