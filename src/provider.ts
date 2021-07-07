import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions } from "@microsoft/signalr";
import { PropsWithChildren, useEffect } from "react";
import { SignalRContext, SignalRHub, SignalRProvider, SignalRProviderProps } from "./types";

export function createSignalRProvider<
    T extends SignalRHub<C, M>,
    C extends string,
    M extends string>(context: SignalRContext<T, C, M>): SignalRProvider {
    const Provider = function SignalRProvider({
        children,
        hubUrl,
        connectEnabled = true,
        onError,
        dependencies,
        autoReconnect = true,
        ...connectionOptions
    }: PropsWithChildren<SignalRProviderProps>) {

        function connect() {
            const connection = createConnection(hubUrl, connectionOptions, autoReconnect);

            context.connection = connection;
        }

        function cleanup() {

        }

        useEffect(() => {
            
            return cleanup;
        }, [connectEnabled, hubUrl, ...dependencies]);

        return children;
    }


    return Provider;
}

function createConnection(hubUrl: string, options: IHttpConnectionOptions, autoReconnect: boolean): HubConnection {
    let builder = new HubConnectionBuilder()
        .withUrl(hubUrl, options)
    
    if(autoReconnect) {
        builder = builder.withAutomaticReconnect();
    }

    return builder.build();
}
