import tableUtils from "../third_party/table-utils";
import { Signal } from "../third_party/lemon-signal";
import Object from "@rbxts/object-utils";
import { AfterFrameMiddleware, BeforeFrameMiddleware, System } from "shared/types";

export class Loop<T extends unknown[]> {
	private readonly systems: System<T>[] = [];
	private readonly beforeFrameMiddlewares: BeforeFrameMiddleware<T>[] = [];
	private readonly afterFrameMiddlewares: AfterFrameMiddleware<T>[] = [];
	private systemsByEvent: Map<string, System<T>[]> = new Map();
	private readonly args: T;
	private started: boolean = false;
	private lastTime: number = os.clock();
	private frameNumber: number = 0;

	constructor(...args: T) {
		this.args = args;
		this.systemsByEvent.set("default", []);
	}

	public scheduleSystem(system: System<T>) {
		if (this.systems.includes(system)) return warn(`System '${system.toString()}' already scheduled`);
		this.systems.push(system);
		const event = system.event ?? "default";
		this.systemsByEvent.set(event, this.sortSystems([...(this.systemsByEvent.get(event) ?? []), system]));
	}

	public replaceSystem(old: System<T>, newSystem: System<T>) {
		// TODO: Implement function without using removeSystem
		this.removeSystem(old);
		this.scheduleSystem(newSystem);
	}

	public removeSystem(system: System<T>) {
		const index = this.systems.indexOf(system);
		if (index === -1) return warn(`System '${system.toString()}' not found`);
		this.systems.remove(index);
		const event = system.event ?? "default";
		this.systemsByEvent.get(event)!.remove(this.systemsByEvent.get(event)!.indexOf(system));
		this.systemsByEvent.set(event, this.sortSystems(this.systemsByEvent.get(event)!));
	}

	public scheduleSystems(systems: System<T>[]) {
		const scheduledEvents: string[] = [];
		systems.forEach((system) => {
			if (this.systems.includes(system)) return warn(`System '${system.toString()}' already scheduled`);
			this.systems.push(system);
			const event = system.event ?? "default";
			this.systemsByEvent.set(event, [...(this.systemsByEvent.get(event) ?? []), system]);
			scheduledEvents.push(event);
		});
		scheduledEvents.forEach((event) => {
			this.systemsByEvent.set(event, this.sortSystems(this.systemsByEvent.get(event)!));
		});
	}

	public addBeforeFrameMiddleware(middleware: BeforeFrameMiddleware<T>) {
		if (this.beforeFrameMiddlewares.includes(middleware)) return warn("Middleware already added");
		this.beforeFrameMiddlewares.push(middleware);
	}

	public addAfterFrameMiddleware(middleware: AfterFrameMiddleware<T>) {
		if (this.afterFrameMiddlewares.includes(middleware)) return warn("Middleware already added");
		this.afterFrameMiddlewares.push(middleware);
	}

	private sortSystems(systems: System<T>[]): System<T>[] {
		const sortedSystems: System<T>[] = [];

		const visited: Set<System<T>> = new Set();
		const recursionStack: Set<System<T>> = new Set();

		const visit = (system: System<T>) => {
			if (recursionStack.has(system)) {
				throw error(`Circular dependency detected involving system '${system}'`);
			}

			if (!visited.has(system)) {
				recursionStack.add(system);
				if (system.before) {
					system.before.forEach((dep) => {
						if (!this.systems.includes(dep)) {
							throw error(`Dependency '${dep}' specified in '${system}' does not exist`);
						}
						visit(dep);
					});
				}
				recursionStack.delete(system);
				visited.add(system);
				sortedSystems.push(system);
			}
		};

		systems.forEach((system) => {
			visit(system);
		});

		return tableUtils.Reverse(sortedSystems) as System<T>[];
	}

	public begin(events: { [index: string]: Signal<[]> }) {
		if (this.started) return warn("Loop already started");
		this.started = true;
		Object.entries(events).forEach(([name, event]) => {
			const events = this.systemsByEvent.get(name as string);
			this.systemsByEvent.set(name as string, this.sortSystems(events ?? []));
			event.Connect(() => {
				this.run(name as string);
			});
		});
	}

	private run(event: string) {
		const scheduledSystems = this.systemsByEvent.get(event);
		const currentTime = os.clock();
		const dt = currentTime - this.lastTime;
		this.lastTime = currentTime;
		if (!scheduledSystems) return warn(`No systems found for event '${event}'`);
		this.beforeFrameMiddlewares.forEach((middleware) => {
			middleware(dt, this.frameNumber, scheduledSystems, event, ...this.args);
		});
		const runData = new Map<System<T>, [string, number]>();
		scheduledSystems.forEach((system) => {
			debug.profilebegin(`[System]: ${system.toString()}`);
			const thread = coroutine.create(system.update);
			const startTime = os.clock();
			const [success, err] = coroutine.resume(thread, dt, this.frameNumber, ...this.args);
			const duration = os.clock() - startTime;
			if (coroutine.status(thread) !== "dead") {
				task.spawn(error, `Yielding is not allowed in systems. System: ${system.toString()}`);
			}
			if (!success) {
				const message = `Error in system '${system.toString()}': ${err} \n ${debug.traceback(thread)}`;
				runData.set(system, [message, duration]);
			} else {
				runData.set(system, ["Success", duration]);
			}
			debug.profileend();
		});
		this.afterFrameMiddlewares.forEach((middleware) => {
			middleware(dt, this.frameNumber, runData, event, ...this.args);
		});
		this.frameNumber++;
	}
}
