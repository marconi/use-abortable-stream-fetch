import { useState, useEffect } from 'react';

interface StreamState {
  data: ArrayBuffer | null;
  error: Error | null;
  controller: AbortController;
}

interface RequestInitStream extends RequestInit {
  streaming?: boolean;
}

const concatBuffers = (b1: ArrayBuffer, b2: ArrayBuffer) : ArrayBuffer => {
  const tmp = new Uint8Array(b1.byteLength + b2.byteLength);
  tmp.set(new Uint8Array(b1), 0);
  tmp.set(new Uint8Array(b2), b1.byteLength);
  return tmp;
};

const useAbortableStreamFetch = (url: string, options?: RequestInitStream): {
  data: ArrayBuffer | null,
  error: Error | null,
  abort: () => void,
} => {

  const [state, setState] = useState<StreamState>({
    data: null,
    error: null,
    controller: new AbortController(),
  });

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(url, {
          ...options,
          signal: state.controller.signal,
        });
        if (!resp.ok || !resp.body) {
          throw resp.statusText;
        }

        const reader = resp.body.getReader();
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }

          setState(prevState => {
            const prevData = ((prevState.data) ? prevState.data :  new Int8Array()) as ArrayBuffer;
            return {
              ...prevState,
              data: concatBuffers(prevData, value),
            };
          });
        }
      } catch (err) {
        const error = err.name !== 'AbortError' ? err : null;
        setState(prevState => ({ ...prevState, ...{ error } }));
      }
    })();

    return () => state.controller.abort();
  }, [url]);

  return {
    data: state.data,
    error: state.error,
    abort: () => state.controller && state.controller.abort(),
  };
};

export default useAbortableStreamFetch;
