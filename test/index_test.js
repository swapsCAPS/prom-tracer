const client     = require('prom-client')
const promTracer = require('../src')
const { expect } = require('chai')

describe('prom-tracer', function () {
  this.timeout(10000)

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  beforeEach(function () {
    client.register.clear()
  })

  describe('Guards', function () {
    it('has client', function () {
      const fn = () => promTracer({})
      expect(fn).to.throw('prom-tracer - Needs an instance of prom-client')
    })

    it('has namespace', function () {
      const fn = () => promTracer({ client })
      expect(fn).to.throw('prom-tracer - Needs a namespace')
    })

    it('needs correct args', function () {
      const tracer = promTracer({ client, ns: 'test' })
      const fn     = () => tracer.trace({})
      expect(fn).to.throw('prom-tracer - Unexpected arguments passed to trace()')
    })

    it('needs a function name', function () {
      const tracer = promTracer({ client, ns: 'test' })
      const fn     = () => tracer.trace(() => {})
      expect(fn).to.throw('prom-tracer - Needs a named function, or string as second arg')
    })
  })

  describe('Happy', function () {
    it('works with named functions', async function () {
      const tracer = promTracer({ client, ns: 'hi_there' })

      const tracedSleep = tracer.trace(sleep)

      await tracedSleep(1000)

      const lines = (await client.register.metrics()).split('\n')
      expect(lines).to.have.lengthOf.above(10)

      const filtered = lines.filter(l => !l.includes('hi_there_tracer_sum')) // Will differ per test

      expect(filtered).to.deep.eq([
        '# HELP hi_there_tracer milliseconds it took functions to finish',
        '# TYPE hi_there_tracer histogram',
        'hi_there_tracer_bucket{le="5",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="10",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="20",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="50",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="100",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="200",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="500",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="1000",fnName="sleep"} 0',
        'hi_there_tracer_bucket{le="2000",fnName="sleep"} 1',
        'hi_there_tracer_bucket{le="5000",fnName="sleep"} 1',
        'hi_there_tracer_bucket{le="10000",fnName="sleep"} 1',
        'hi_there_tracer_bucket{le="20000",fnName="sleep"} 1',
        'hi_there_tracer_bucket{le="50000",fnName="sleep"} 1',
        'hi_there_tracer_bucket{le="100000",fnName="sleep"} 1',
        'hi_there_tracer_bucket{le="+Inf",fnName="sleep"} 1',
        'hi_there_tracer_count{fnName="sleep"} 1',
        '',
      ])
    })

    it('works with anonymous functions', async function () {
      const tracer = promTracer({ client, ns: 'hi_there' })

      const nap = tracer.trace('nap', (ms) => new Promise((resolve) => setTimeout(resolve, ms)))
      await nap(1000)

      const lines = (await client.register.metrics()).split('\n')
      expect(lines).to.have.lengthOf.above(10)

      const filtered = lines.filter(l => !l.includes('hi_there_tracer_sum')) // Will differ per test

      expect(filtered).to.deep.eq([
        '# HELP hi_there_tracer milliseconds it took functions to finish',
        '# TYPE hi_there_tracer histogram',
        'hi_there_tracer_bucket{le="5",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="10",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="20",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="50",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="100",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="200",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="500",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="1000",fnName="nap"} 0',
        'hi_there_tracer_bucket{le="2000",fnName="nap"} 1',
        'hi_there_tracer_bucket{le="5000",fnName="nap"} 1',
        'hi_there_tracer_bucket{le="10000",fnName="nap"} 1',
        'hi_there_tracer_bucket{le="20000",fnName="nap"} 1',
        'hi_there_tracer_bucket{le="50000",fnName="nap"} 1',
        'hi_there_tracer_bucket{le="100000",fnName="nap"} 1',
        'hi_there_tracer_bucket{le="+Inf",fnName="nap"} 1',
        'hi_there_tracer_count{fnName="nap"} 1',
        '',
      ])
    })
  })
})
