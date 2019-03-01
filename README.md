# use-abortable-stream-fetch

React hook for fetching streams that can be aborted.

### Installation

```bash
yarn add use-abortable-stream-fetch
```

### Usage:

```javascript
import React, { useEffect } from 'react';
import useAbortableStreamFetch from 'use-abortable-stream-fetch';

const Logs = () => {
  const url = '...';
  const { data, error, abort } = useAbortableStreamFetch(url);

  useEffect(() => {
    dispatch(actions.processData(data));
  }, [data]);

  return <div>{data}</div>;
};

export default Logs;
```
