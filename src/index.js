class PromTracerError extends Error {
  constructor (message) {
    super(`prom-tracer - ${message}`)
  }
}

module.exports = ({ client, namespace, ns, buckets, registers = [] }) =>  {
  namespace = namespace || ns
  buckets   = buckets || [
    5,     10,     20,   50,   100,   200,
    500,   1000,   2000, 5000, 10000, 20000,
    50000, 100000,
  ]

  if (!client) {
    throw new PromTracerError('Needs an instance of prom-client')
  }
  if (!namespace) {
    throw new PromTracerError('Needs a namespace')
  }

  const histogram = new client.Histogram({
    name:       `${namespace}_tracer`,
    help:       'milliseconds it took functions to finish',
    buckets,
    labelNames: [ 'fnName' ],
  })

  if (registers.length) {
    registers.forEach(r => r.registerMetric(histogram))
  } else {
    client.register.registerMetric(histogram)
  }

  const trace = (arg1, arg2) => {
    let fnName, fn
    if (typeof arg1 === 'function') {
      fn     = arg1
      fnName = fn.name
    } else if (typeof arg1 === 'string' && typeof arg2 === 'function') {
      fn     = arg2
      fnName = arg1
    } else {
      throw new PromTracerError('Unexpected arguments passed to trace()')
    }

    if (!fnName) {
      throw new PromTracerError('Needs a named function, or string as second arg')
    }

    return async (...args) => {
      const t      = Date.now()
      const result = await fn(...args)
      histogram.observe({ fnName }, (Date.now() - t))
      return result
    }
  }

  return {
    histogram,
    trace,
  }
}
