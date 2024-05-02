import { ReplicatedStorage } from "@rbxts/services";
import start from "client/start";
import Tree from "shared/third_party/tree";

start(
	[Tree.Await(ReplicatedStorage, "Client/systems"), Tree.Await(ReplicatedStorage, "Shared/systems")],
	[
		Tree.Await(ReplicatedStorage, "Client/middlewares/before"),
		Tree.Await(ReplicatedStorage, "Shared/middlewares/before"),
	],
	[
		Tree.Await(ReplicatedStorage, "Client/middlewares/after"),
		Tree.Await(ReplicatedStorage, "Shared/middlewares/after"),
	],
);
