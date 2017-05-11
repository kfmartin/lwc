import * as target from "../def.js";
import { Element } from "../html-element.js";
import assert from 'power-assert';

describe('def.js', () => {
    describe('#getComponentDef()', () => {

        it('should understand empty constructors', () => {
            const def = class MyComponent extends Element {}
            assert.deepEqual(target.getComponentDef(def), {
                name: 'MyComponent',
                isStateful: true,
                props: {},
                methods: {},
                observedAttrs: {},
            });
        });

        it('should prevent mutations of important keys but should allow expondos for memoization and polyfills', () => {
            class MyComponent extends Element {}
            const def = target.getComponentDef(MyComponent);
            assert.throws(() => {
                def.name = 'something else';
            });
            def.expando = 1;
            assert.equal(1, def.expando);
        });

        it('should throw for stateful components not extending Element', () => {
            const def = class MyComponent {}
            assert.throws(() => target.getComponentDef(def));
        });

        it('should understand static observedAttributes', () => {
            class MyComponent extends Element  {
                attributeChangedCallback() {}
            }
            MyComponent.observedAttributes = ['foo', 'x-bar'];
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                isStateful: true,
                props: {},
                methods: {},
                observedAttrs: {
                    foo: 1,
                    "x-bar": 1,
                },
            });
        });

        it('should match WC semantic to ignore observedAttributes if no callback is provided', () => {
            class MyComponent extends Element  {}
            MyComponent.observedAttributes = ['foo', 'x-bar'];
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                isStateful: true,
                props: {},
                methods: {},
                observedAttrs: {},
            });
        });

        it('should understand static publicMethods', () => {
            class MyComponent extends Element  {
                foo() {}
                bar() {}
            }
            MyComponent.publicMethods = ['foo', 'bar'];
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                isStateful: true,
                props: {},
                methods: {
                    foo: 1,
                    bar: 1,
                },
                observedAttrs: {},
            });
        });

        it('should infer attribute name from public props', () => {
            class MyComponent extends Element  {}
            MyComponent.publicProps = {
                foo: true,
                xBar: {},
            };
            assert.deepEqual(target.getComponentDef(MyComponent), {
                name: 'MyComponent',
                isStateful: true,
                props: {
                    foo: 1,
                    xBar: 1,
                },
                methods: {},
                observedAttrs: {},
            });
        });

    });
});
