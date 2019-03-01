import { useState, useEffect } from 'react';

const useAbortableStreamFetch = (url: string, options?: RequestInit): {
  data: Uint8Array | null,
  error: Error | null,
  abort: () => void,
} => {

  interface StreamState {
    data: Uint8Array | null;
    error: Error | null;
    controller: AbortController;
  }

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

          setState(prevState => ({ ...prevState, ...{ data: value } }));
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setState(prevState => ({ ...prevState, ...{ error: err } }));
        }
      }
    })();

    return () => state.controller.abort();
  }, [url, options]);

  return {
    data: state.data,
    error: state.error,
    abort: () => state.controller && state.controller.abort(),
  };
};

export default useAbortableStreamFetch;
