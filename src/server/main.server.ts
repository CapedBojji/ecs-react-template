import Tree from "shared/third_party/tree";
import start from "./start";
import { ReplicatedStorage } from "@rbxts/services";

start(
	[Tree.Find(script.Parent!, "systems")!, Tree.Find(ReplicatedStorage, "Shared/systems")!],
	[Tree.Await(script.Parent!, "middlewares/before"), Tree.Await(ReplicatedStorage, "Shared/middlewares/before")],
	[Tree.Await(script.Parent!, "middlewares/after"), Tree.Await(ReplicatedStorage, "Shared/middlewares/after")],
);
