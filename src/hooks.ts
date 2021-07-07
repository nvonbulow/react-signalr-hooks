import { useEffect, DependencyList } from 'react';

import type {
    SignalRHub,
    SignalRContext,
    MethodParameters,
    MethodReturnType,
    SignalRInvoke,
    CallbackFunction,
    CallbackParameters,
    SignalRUseCallbackHook,
    SignalRUseMethodHook,
} from './types';

export function createSignalRInvokeMethod<
	T extends SignalRHub<C, M>,
    C extends string,
    M extends string,
	P extends MethodParameters<T, C, M> = MethodParameters<T, C, M>,
	R extends MethodReturnType<T, C, M> = MethodReturnType<T, C, M>,
>(context: SignalRContext<T, C, M>): SignalRInvoke<T, C, M> { 
	const invoke = async (methodName: M, ...args: P): Promise<R> =>
        context.connection.invoke(methodName, ...args);
	return invoke;
}

export function createSignalRCallbackHook<
	T extends SignalRHub<C, M>,
    C extends string,
    M extends string,
	F extends CallbackFunction<T, C, M>,
>(context: SignalRContext<T, C, M>): SignalRUseCallbackHook<T, C, M> {
    const useSignalRCallback = (callbackName: C, callback: F, deps: DependencyList) => {
        useEffect(() => {
            function _callback(...args: CallbackParameters<T, C, M>) {
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

export function createSignalRMethodHook<
	T extends SignalRHub<C, M>,
    C extends string,
    M extends string,
	P extends MethodParameters<T, C, M> = MethodParameters<T, C, M>,
>(context: SignalRContext<T, C, M>): SignalRUseMethodHook<T, C, M> {
	const useSignalRMethod = (methodName: M) => async (...args: P) => context.invoke(methodName, ...args);
	return useSignalRMethod;
}
