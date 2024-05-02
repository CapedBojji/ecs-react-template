import ecr from "@rbxts/ecr";
import store from "./store";
import { Loop } from "shared/ecs/Loop";
import { ClientEcsArgs, ClientSystem } from "./types";
import { ClientDebugger } from "shared/ecs/Debugger";
import { Context, HotReloader } from "@rbxts/rewire";
import { AfterFrameMiddleware, BeforeFrameMiddleware, Events } from "shared/types";
import { Signal } from "shared/third_party/lemon-signal";
import { RunService } from "@rbxts/services";
import { LoopArgsNames } from "./enums";

export = function (containers: Instance[], beforeFrameMiddlewares: Instance[], afterFrameMiddlewares: Instance[]) {
	const world = ecr.registry();
	const args = new Map<string, unknown>();
	const loop = new Loop<ClientEcsArgs>(world, store, args);
	const clientDebugger = new ClientDebugger();
	clientDebugger.track(loop, "MainLoop");

	const systemByModule = new Map<ModuleScript, ClientSystem>();
	let firstRunSystems: ClientSystem[] | undefined = [];
	const hotreloader = new HotReloader();

	function loadModule(module: ModuleScript, context: Context) {
		const originalModule = context.originalModule;
		const [ok, system] = pcall(require, module);
		if (!ok) return warn(`Failed to load module ${module.GetFullName()}: ${system}`);
		if (firstRunSystems !== undefined) {
			firstRunSystems.push(system as ClientSystem);
		} else if (systemByModule.has(module)) {
			loop.replaceSystem(systemByModule.get(module)!, system as ClientSystem);
		} else {
			loop.scheduleSystem(system as ClientSystem);
		}
		systemByModule.set(originalModule, system as ClientSystem);
	}

	function unloadModule(_: ModuleScript, context: Context) {
		if (context.isReloading) return;
		const originalModule = context.originalModule;
		if (systemByModule.has(originalModule)) {
			loop.removeSystem(systemByModule.get(originalModule)!);
			systemByModule.delete(originalModule);
		}
	}

	containers.forEach((container) => {
		hotreloader.scan(container, loadModule, unloadModule);
	});

	beforeFrameMiddlewares.forEach((middlewares) => {
		middlewares.GetChildren().forEach((middleware) => {
			if (middleware.IsA("ModuleScript")) {
				const [ok, middlewareFunction] = pcall(require, middleware);
				if (!ok) return warn(`Failed to load middleware ${middleware.GetFullName()}: ${middlewareFunction}`);
				loop.addBeforeFrameMiddleware(middlewareFunction as BeforeFrameMiddleware<ClientEcsArgs>);
			}
		});
	});

	afterFrameMiddlewares.forEach((middlewares) => {
		middlewares.GetChildren().forEach((middleware) => {
			if (middleware.IsA("ModuleScript")) {
				const [ok, middlewareFunction] = pcall(require, middleware);
				if (!ok) return warn(`Failed to load middleware ${middleware.GetFullName()}: ${middlewareFunction}`);
				loop.addAfterFrameMiddleware(middlewareFunction as AfterFrameMiddleware<ClientEcsArgs>);
			}
		});
	});

	loop.scheduleSystems(firstRunSystems);
	firstRunSystems = undefined;

	const events: Events = {
		default: new Signal(),
		render: new Signal(),
	};
	RunService.PreRender.Connect(() => {
		const skipRender = args.get(LoopArgsNames.SKIP_RENDER);
		if (skipRender === undefined || !(skipRender as boolean)) events.render.Fire();
	});
	RunService.PostSimulation.Connect(() => {
		events.default.Fire();
	});
	loop.begin(events);
};
