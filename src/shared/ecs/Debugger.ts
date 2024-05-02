import { Loop } from "./Loop";

class BaseDebugger {
	track<T extends unknown[]>(loop: Loop<T>, name?: string) {}
}
export class ClientDebugger extends BaseDebugger {}
export class ServerDebugger extends BaseDebugger {}
