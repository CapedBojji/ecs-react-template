import { Registry } from "@rbxts/ecr";
import { RootStore } from "./store";
import { System } from "shared/types";

export type ClientEcsArgs = [Registry, RootStore, Map<string, unknown>];
export type ClientSystem = System<ClientEcsArgs>;
