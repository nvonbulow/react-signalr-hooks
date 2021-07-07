import { useState } from 'react';
import {
    createSignalRContext,
    SignalRHub,
    SignalRHubCallbacks,
    SignalRHubMethods
} from 'react-signalr-hooks';

enum ExampleHubMethods {
  exampleMethod = 'exampleMethod'
}

interface ExampleHubMethodSignatures extends SignalRHubMethods<ExampleHubMethods> {
  exampleMethod: (params: { x: number, y: number }) => string;
}

enum ExampleHubCallbacks {
  exampleCallback = 'exampleCallback',
}

interface ExampleHubCallbackSignatures extends SignalRHubCallbacks<ExampleHubCallbacks> {
  exampleCallback: (retVal: string | number) => string;
}

interface ExampleHub extends SignalRHub<ExampleHubCallbacks, ExampleHubMethods> {
  callbackNames: ExampleHubCallbacks,
  callbacks: ExampleHubCallbackSignatures,
  methodNames: ExampleHubMethods,
  methods: ExampleHubMethodSignatures,
}

let HubContext = createSignalRContext<ExampleHub, ExampleHubCallbacks, ExampleHubMethods>()

function App() {
  const [cbVal, setCbVal] = useState<number | string>(123);

  const exampleMethod = HubContext.useMethod(ExampleHubMethods.exampleMethod);

  HubContext.useCallback(ExampleHubCallbacks.exampleCallback, (retVal) => {
    setCbVal(retVal);
  }, []);

  return <HubContext.Provider
    hubUrl="http://localhost:3000">
      <div onClick={() => exampleMethod({ x: 123, y: 456 })}>{cbVal}</div>
    </HubContext.Provider>
}