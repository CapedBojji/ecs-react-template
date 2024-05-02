type Alphabet = string;

interface Squash {
	string: {
		alphabet: (source: string) => Alphabet;
		convert: (x: string, source: Alphabet, target: Alphabet) => string;
		ser: (x: string, source?: Alphabet) => string;
		des: (x: string, target?: Alphabet) => string;
		serarr: (x: string[], source?: Alphabet) => string;
		desarr: (x: string, target?: Alphabet) => string[];
	};
}

declare const squash: Squash;
export = squash;
