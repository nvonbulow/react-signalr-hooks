import type { HubConnection, IHttpConnectionOptions } from "@microsoft/signalr"
import type { DependencyList } from 'react';

export type SignalRHubMethods<M extends string> = {
	[key in M]: <F extends (...args: any) => any>(...args: Parameters<F>) => any;
}

export type SignalRHubCallbacks<C extends string> = {
	[key in C]: <F extends (...args: any) => void>(...args: Parameters<F>) => void;
}

export interface SignalRHub<
	C extends string,
	M extends string,
> {
	callbackNames: C,
	callbacks: SignalRHubCallbacks<C>,
	methodNames: M,
	methods: SignalRHubMethods<M>,
}

export type MethodNames<
	T extends SignalRHub<string, string>>
		= T extends SignalRHub<string, infer U> ? U : never;
export type MethodParameters<
	T extends SignalRHub<C, M>,
	C extends string,
	M extends string>
		= Parameters<T['methods'][M]>;
export type MethodReturnType<
	T extends SignalRHub<C, M>,
	C extends string,
	M extends string>
		= ReturnType<T['methods'][M]>;

export type CallbackNames<
	T extends SignalRHub<string, string>>
		= T extends SignalRHub<infer U, string> ? U : never;
export type CallbackParameters<
	T extends SignalRHub<C, M>,
	C extends string,
	M extends string>
		= Parameters<T['callbacks'][C]>;
export type CallbackFunction<
	T extends SignalRHub<C, M>,
	C extends string,
	M extends string>
		= (...args: CallbackParameters<T, C, M>) => void;

export type SignalRInvoke<
		T extends SignalRHub<C, M>,
		C extends string,
		M extends string,
		P extends MethodParameters<T, C, M> = MethodParameters<T, C, M>,
		R extends MethodReturnType<T, C, M> = MethodReturnType<T, C, M>>
	= (methodName: M, ...args: P) => Promise<R>;

export type SignalRUseCallbackHook<
		T extends SignalRHub<C, any>,
		C extends string,
		M extends string,
		F extends CallbackFunction<T, C, M> = CallbackFunction<T, C, M>>
	= (callbackName: C, callback: F, depList: DependencyList) => void;

export type SignalRUseMethodHook<
		T extends SignalRHub<C, M>,
		C extends string,
		M extends string,
		P extends MethodParameters<T, C, M> = MethodParameters<T, C, M>,
		R extends MethodReturnType<T, C, M> = MethodReturnType<T, C, M>>
	= (methodName: M) => (...args: P) => Promise<R>;

export interface SignalRProviderProps extends IHttpConnectionOptions {
	connectEnabled?: boolean,
	dependencies?: DependencyList,
	onError?: (error?: Error) => Promise<void>,
	hubUrl: string,
	children: JSX.Element,
	autoReconnect?: boolean,
}

export type SignalRProvider = (props: SignalRProviderProps) => JSX.Element;

export interface SignalRContext<T extends SignalRHub<any, any>, C extends string, M extends string> {
	Provider: SignalRProvider,
	connection: HubConnection | null,
	invoke: SignalRInvoke<T, C, M>,
	useCallback: SignalRUseCallbackHook<T, C, M>,
	useMethod: SignalRUseMethodHook<T, C, M>,
	subscribe: (evtName: C, callback: CallbackFunction<T, C, M>) => void,
	unsubscribe: (evtName: C, callback?: CallbackFunction<T, C, M>) => void,
}
