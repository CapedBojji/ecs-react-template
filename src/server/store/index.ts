import { combineProducers } from "@rbxts/reflex";

export type RootStore = typeof store;
export type RootState = ReturnType<RootStore>;

export function createStore() {
	const store = combineProducers({});

	return store;
}

const store = createStore();
export default store;
