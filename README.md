# prom-tracer

## Quick and Dirty tracing using [prom-client](https://github.com/siimon/prom-client) [Histogram](https://github.com/siimon/prom-client#histogram)

### Usage
```javascript
const client = require('prom-client')
const promTracer = require('prom-tracer')

const tracer = promTracer({ client, ns: 'service_name' })
// Will create service_name_tracer_bucket metrics

// Pass a named function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const tracedSleep = tracer.trace(sleep)
await tracedSleep(1000)

console.log(await client.register.metrics())
// ...
// service_name_tracer_bucket{le="500",fnName="sleep"} 0
// service_name_tracer_bucket{le="1000",fnName="sleep"} 0
// service_name_tracer_bucket{le="2000",fnName="sleep"} 1
// service_name_tracer_bucket{le="5000",fnName="sleep"} 1
// ...

// Or anonymous function
const nap = tracer.trace('nap', (ms) => new Promise((resolve) => setTimeout(resolve, ms)))
await nap(1000)

console.log(await client.register.metrics())
// ...
// service_name_tracer_bucket{le="500",fnName="nap"} 0
// service_name_tracer_bucket{le="1000",fnName="nap"} 0
// service_name_tracer_bucket{le="2000",fnName="nap"} 1
// service_name_tracer_bucket{le="5000",fnName="nap"} 1
// ...
```

### Tests
```
npm run test
```
