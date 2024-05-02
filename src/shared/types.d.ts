import { Registry } from "@rbxts/cmdr";
import { Producer } from "@rbxts/reflex";
import { SharedState } from "./store";
import { Signal } from "./third_party/lemon-signal";

export type SharedEcsArgs = [Registry, Producer<SharedState>, Map<string, unknown>];
export type System<T extends unknown[]> = {
	init?: (...args: T) => void;
	update: (dt: number, frameNumber: number, ...args: T) => void;
	event?: string;
	cleanup?: (...args: T) => void;
	before?: System<T>[];
	toString: () => string;
};
export type BeforeFrameMiddleware<T extends unknown[]> = (
	dt: number,
	frameNumber: number,
	scheduledSystems: System<T>[],
	event: string,
	...args: T
) => void;
export type AfterFrameMiddleware<T extends unknown[]> = (
	dt: number,
	frameNumber: number,
	frameResults: Map<System<T>, [string, number]>,
	event: string,
	...args: T
) => void;
export type SharedSystem = System<SharedEcsArgs>;
export type Events = { [key: string]: Signal<unknown[]> } & { default: Signal<unknown[]> };
