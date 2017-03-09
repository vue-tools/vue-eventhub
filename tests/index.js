import Vue from 'vue'
import eventHub from '../src'
import { expect } from 'chai'

describe('Vue-eventHub', () => {
    Vue.use(eventHub)

    it('no event binding', () => {
        let obj = Vue.eventHub

        expect(obj.emit('event')).to.equal(obj)
    })

    it('on and emit', () => {
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub

        obj.on('event', spy)
        obj.emit('event')
        expect(spy.callCount).to.equal(1)

        obj.emit('event')
        obj.emit('event')
        obj.emit('event')
        obj.emit('event')
        expect(spy.callCount).to.equal(5)

        obj.emit('event event event')
        expect(spy.callCount).to.equal(8)
    })

    it('once', () => {
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub
        
        obj.once('event', spy)
        obj.emit('event')

        expect(spy.callCount).to.equal(1)
        obj.emit('event')
        expect(spy.callCount).to.equal(1)
    })

    it('binding and triggering multiple events', function(){
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub

        obj.on('a b c', spy)
        obj.emit('a')
        expect(spy.callCount).to.equal(1)

        obj.emit('a b')
        expect(spy.callCount).to.equal(3)

        obj.emit('c')
        expect(spy.callCount).to.equal(4)

        obj.off('a c')
        obj.emit('a b c')
        expect(spy.callCount).to.equal(5)
    })

    it('on, then unbind all functions', function(){
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub

        obj.on('event', spy)
        obj.emit('event')
        expect(spy.callCount).to.equal(1)

        obj.off('event')
        obj.emit('event')
        expect(spy.callCount).to.equal(1)
    })

    it('bind two callbacks, unbind only one', function(){
        let obj, spyA, spyB

        spyA = sinon.spy()
        spyB = sinon.spy()
        obj = Vue.eventHub

        obj.on('event', spyA)
        obj.on('event', spyB)
        obj.emit('event')
        expect(spyA.callCount).to.equal(1)
        expect(spyB.callCount).to.equal(1)

        obj.off('event', spyA)
        obj.emit('event')
        expect(spyA.callCount).to.equal(1)
        expect(spyB.callCount).to.equal(2)
    })

    it('unbind a callbakc in the midst of it firing', function(){
        let obj, spy
        
        spy = sinon.spy()
        obj = Vue.eventHub

        function callback(){
            spy()
            obj.off('event', callback)
        }

        obj.on('event', callback)
        obj.emit('event')
        obj.emit('event')
        obj.emit('event')
        expect(spy.callCount).to.equal(1)
    })

    it('two binds that unbind themselves', function(){
        let obj, spyA, spyB

        spyA = sinon.spy()
        spyB = sinon.spy()
        obj = Vue.eventHub

        function incrA(){
            spyA()
            obj.off('event', incrA)
        }

        function incrB(){
            spyB()
            obj.off('event', incrB)
        }

        obj.on('event', incrA)
        obj.on('event', incrB)
        obj.emit('event')
        obj.emit('event')
        obj.emit('event')

        expect(spyA.callCount).to.equal(1)
        expect(spyB.callCount).to.equal(1)
    })

    it('bind a callback with a supplied context', function(){
        let obj, spy, context

        context = {}
        obj = Vue.eventHub
        spy = sinon.spy()

        obj.on('event', spy, context)
        obj.emit('event')
        expect(spy.calledOn(context))
    })

    it('nested trigger with unbind', function(){
        let obj, spyA, spyB

        spyA = sinon.spy()
        spyB = sinon.spy()
        obj = Vue.eventHub

        function incr1(){
            spyA()
            obj.off('event', incr1)
            obj.emit('event')
        }

        obj.on('event', incr1)
        obj.on('event', spyB)
        obj.emit('event')
        expect(spyA.callCount).to.equal(1)
        expect(spyB.callCount).to.equal(2)
    })

    it('callback list is not altered during trigger', function(){
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub

        obj.on('event', function(){
            obj.on('event', spy)
        }).emit('event')

        expect(spy.callCount).to.equal(0)

        obj.off().on('event', function(){
            obj.on('event', spy)
        }).on('event', spy).emit('event')

        expect(spy.callCount).to.equal(1)
    })

    it('`o.emit("x y")` is equal to `o.emit("x").emit("y")`', function(){
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub

        obj.on('x', function(){
            obj.on('y', spy)
        })
        obj.emit('x y')
        expect(spy.callCount).to.equal(1)

        spy.reset()

        obj.off()
        obj.on('x', function(){
            obj.on('y', spy)
        })
        obj.emit('y x')
        expect(spy.callCount).to.equal(0)
    })

    it('if no callback is provided, `on` is a noop', function(){
        expect(function(){
            Vue.eventHub.on('test').emit('test')
        }).not.to.throw()
    })

    it('off is chainable', function(){
        let obj = Vue.eventHub

        expect(obj.off('event')).to.equal(obj)

        obj.on('event', function(){}, obj)
        expect(obj.off('event', null, obj)).to.equal(obj)

        obj.on('event', function(){}, obj)
        expect(obj.off('event')).to.equal(obj)
    })

    it('trigger returns callback status', function(){
        let obj, stub1, stub2, stub3

        obj = Vue.eventHub
        stub1 = sinon.stub()
        stub2 = sinon.stub()

        obj.on('a', stub1)
        obj.on('a', stub2)

        stub1.returns(false)
        stub2.returns(true)
        expect(obj.emit('a')).to.equal(false)

        stub1.returns(true)
        stub2.returns(true)
        expect(obj.emit('a')).to.equal(true)

        stub1.returns(true)
        stub2.returns(false)
        expect(obj.emit('a')).to.equal(false)
    })

    it('callback context', function(){
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub
        
        obj.on('a', spy)
        obj.emit('a')
        expect(spy.calledOn(obj)).to.be.ok
    })

    it('trigger arguments', function(){
        let obj, spy

        spy = sinon.spy()
        obj = Vue.eventHub

        obj.on('a', spy)
        obj.emit('a', 1)
        expect(spy.calledWith(1)).to.be.ok
        obj.emit('a', 1, 2)
        expect(spy.calledWith(1, 2)).to.be.ok
        obj.emit('a', 1, 2, 3)
        expect(spy.calledWith(1, 2, 3)).to.be.ok
        obj.emit('a', 1, 2, 3, 4)
        expect(spy.calledWith(1, 2, 3, 4)).to.be.ok
    })
})