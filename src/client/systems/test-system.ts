import { Registry } from "@rbxts/ecr";
import { CombineProducers } from "@rbxts/reflex";
import { ClientEcsArgs } from "client/types";
import { System } from "shared/types";

const system: System<ClientEcsArgs> = {
	update: (
		dt: number,
		frameNumber: number,
		args_0: Registry,
		args_1: CombineProducers<{}>,
		args_2: Map<string, unknown>,
	) => {
		print("Hello, World!");
	},
	event: "",
	toString: () => "Test System",
};

export = system;
