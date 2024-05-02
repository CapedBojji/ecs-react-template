declare namespace Tree {
	interface Constructor {
		Find: <T extends Instance>(parent: Instance, path: string) => T | undefined;

		Await: (parent: Instance, path: string, timeout?: number) => Instance;

		Exists: (parent: Instance, path: string, assertIsA?: keyof Instances) => boolean;
	}
}

declare const Tree: Tree.Constructor;

export = Tree;
