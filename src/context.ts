import {
    createSignalRCallbackHook,
    createSignalRInvokeMethod,
    createSignalRMethodHook
} from './hooks';
import { createSignalRProvider } from './provider';

import type {
    SignalRHub,
    SignalRContext,
} from './types';

export function createSignalRContext<
    T extends SignalRHub<C, M>,
    C extends string,
    M extends string 
>(): SignalRContext<T, C, M> {
	const context: SignalRContext<T, C, M> = {
        connection: null,
        useCallback: null as any, // assigned later once the rest of the context is built
        useMethod: null as any,   // same as above ^^^
        invoke: null as any,      // ^^^
        subscribe: null as any,   // ^^^
        unsubscribe: null as any, // ^^^
        Provider: null as any,    // ^^^
	};

    context.useCallback = createSignalRCallbackHook(context);
    context.useMethod = createSignalRMethodHook(context);
    context.invoke = createSignalRInvokeMethod(context);
    context.subscribe = (evtName, callback) => context.connection.on(evtName, callback);
    context.unsubscribe = (evtName, callback) => context.connection.off(evtName, callback);

    context.Provider = createSignalRProvider(context)

	return context;
}
