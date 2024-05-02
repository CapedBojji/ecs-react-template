import { Registry } from "@rbxts/cmdr";
import { Producer } from "@rbxts/reflex";
import { $print } from "rbxts-transform-debug";
import { SharedState } from "shared/store";
import { SharedSystem } from "shared/types";
import otherSharedSystem from "./2";

const system: SharedSystem = {
	init: () => {
		$print(`Shared System Init`);
	},

	update: (
		dt: number,
		frameNumber: number,
		args_0: Registry,
		args_1: Producer<SharedState>,
		args_2: Map<string, unknown>,
	) => {
		$print(`Hello, World!`);
	},
	before: [otherSharedSystem],

	toString: () => "Test Shared System",
};

export = system;
