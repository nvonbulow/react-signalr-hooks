import { HubConnection, IHttpConnectionOptions } from '@microsoft/signalr';
import { useEffect, DependencyList } from 'react';

type SignalRHubMethods<M extends string = string> = {
	[name in M]: <F extends (...args: any[]) => any>
		(...args: Parameters<F>) => void;
}

type SignalRHubCallbacks<C extends string = string> = {
	[name in C]: <F extends (...args: any[]) => any>
		(...args: Parameters<F>) => void;
}

export interface SignalRHub<
	C extends string = string,
	M extends string = string,
> {
	callbackNames: C,
	callbacks: SignalRHubCallbacks<C>,
	methodNames: M,
	methods: SignalRHubMethods<M>,
}

export interface SignalRProviderProps extends IHttpConnectionOptions {
	connectEnabled?: boolean,
	dependencies?: DependencyList,
	onError?: (error?: Error) => Promise<void>,
	hubUrl: string,
	children: JSX.Element,
}

type MethodNames<T extends SignalRHub> = T['methodNames'];
type MethodParameters<T extends SignalRHub, E extends MethodNames<T>> = Parameters<T['methods'][E]>;
type MethodReturnType<T extends SignalRHub, E extends MethodNames<T>> = ReturnType<T['methods'][E]>;

type CallbackNames<T extends SignalRHub> = T['callbackNames'];
type CallbackParameters<T extends SignalRHub, E extends CallbackNames<T>> = Parameters<T['callbacks'][E]>;
type CallbackFunction<T extends SignalRHub, E extends CallbackNames<T>> = (...args: CallbackParameters<T, E>) => void;

type SignalRInvoke<
		T extends SignalRHub,
		E extends MethodNames<T> = MethodNames<T>,
		C extends MethodParameters<T, E> = MethodParameters<T, E>,
		R extends MethodReturnType<T, E> = MethodReturnType<T, E>>
	= (methodName: E, ...args: C) => Promise<R>;

type SignalRUseCallbackHook<
		T extends SignalRHub,
		E extends CallbackNames<T> = CallbackNames<T>,
		C extends CallbackFunction<T, E> = CallbackFunction<T, E>>
	= (callbackName: E, callback: C, depList: DependencyList) => void;

type SignalRUseMethodHook<
		T extends SignalRHub,
		E extends MethodNames<T> = MethodNames<T>,
		C extends MethodParameters<T, E> = MethodParameters<T, E>,
		R extends MethodReturnType<T, E> = MethodReturnType<T, E>>
	= (methodName: E) => (...args: C) => Promise<R>;

export interface SignalRContext<T extends SignalRHub> {
	Provider: (props: SignalRProviderProps) => JSX.Element,
	connection: HubConnection | null,
	invoke: SignalRInvoke<T>,
	useCallback: SignalRUseCallbackHook<T>,
	useMethod: SignalRUseMethodHook<T>,
	subscribe: (evtName: CallbackNames<T>, callback: CallbackFunction<T, CallbackNames<T>>) => void,
	unsubscribe: (evtName: CallbackNames<T>, callback?: CallbackFunction<T, CallbackNames<T>>) => void,
}

export function createSignalRContext<T extends SignalRHub>(): SignalRContext<T> {
	const context: SignalRContext<T> = {
		connection: null,
		useCallback: null as any, // assigned later once the rest of the context is built
		useMethod: null as any,   // same as above ^^^
		invoke: null as any,      // ^^^
		Provider: null as any,    // ^^^
        subscribe: null as any,   // ^^^
        unsubscribe: null as any, // ^^^
	};

    context.useCallback = createSignalRCallbackHook(context);
    context.useMethod = createSignalRMethodHook(context);
    context.invoke = createSignalRInvokeMethod(context);
    context.subscribe = (evtName, callback) => context.connection.on(evtName, callback);
    context.unsubscribe = (evtName, callback) => context.connection.off(evtName, callback);

    // context.Provider = createSignalRProvider(context)

	return context;
}

function createSignalRInvokeMethod<
	T extends SignalRHub,
	E extends MethodNames<T>,
	C extends MethodParameters<T, E>,
	R extends MethodReturnType<T, E>,
>(context: SignalRContext<T>): SignalRInvoke<T> { 
	const invoke = async (methodName: E, ...args: C): Promise<R> => {
		return context.connection.invoke(methodName, ...args);
	};
	return invoke;
}

function createSignalRCallbackHook<
	T extends SignalRHub,
	E extends CallbackNames<T>,
	C extends CallbackFunction<T, E>,
>(context: SignalRContext<T>): SignalRUseCallbackHook<T, E> {
    const useSignalRCallback = (callbackName: E, callback: C, deps: DependencyList) => {
        useEffect(() => {
            function _callback(...args: CallbackParameters<T, E>) {
                callback(...args);
            }

            context.subscribe(callbackName, _callback);

            return () => {
                context.unsubscribe(callbackName, _callback);
            }
        }, deps);
    };
    return useSignalRCallback;
}

function createSignalRMethodHook<
	T extends SignalRHub,
	E extends MethodNames<T>,
	C extends MethodParameters<T, E>,
>(context: SignalRContext<T>): SignalRUseMethodHook<T, E> {
	const useSignalRMethod = (methodName: E) => async (...args: C) => context.invoke(methodName, ...args);
	return useSignalRMethod;
}