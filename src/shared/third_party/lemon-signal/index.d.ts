export declare type SignalCallback<T extends unknown[]> = (...args: T) => unknown;
export declare type SignalWait<T> = T extends unknown[] ? LuaTuple<T> : T;

export declare class Connection<T> {
	public readonly Connected: boolean;

	public Disconnect(): void;
	public Reconnect(): void;
}

export declare class Signal<T extends unknown[]> {
	public readonly RBXScriptConnection?: RBXScriptConnection;

	public static is: <O extends object>(object: O) => boolean;
	public static wrap: <T extends Callback>(signal: RBXScriptSignal<T>) => Signal<Parameters<T>>;

	public Connect(fn: SignalCallback<T>): Connection<T>;
	public Once(fn: SignalCallback<T>): Connection<T>;
	public Wait(): SignalWait<T>;
	public Fire(...args: T): void;
	public DisconnectAll(): void;
	public Destroy(): void;
}
