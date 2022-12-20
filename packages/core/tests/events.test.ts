import { eventOfType, IRuntimeEventBuilder, RuntimeEvent } from "../src";

class MockBuilder implements IRuntimeEventBuilder {
    calls : number = 0;
    
    buildEvent<T>(): RuntimeEvent<T> {
        this.calls++;

        const e: RuntimeEvent<T> = {
            emit: ()=>{},
            on: (callback)=>{}
        }
        return e;
    }
}

describe('Core Events', () => {
    describe('defineEvent', () => {
        type Item = { id: string; name: string }

        test('Must create a boolean event', () => {
            const builder = new MockBuilder();

            const def = eventOfType<boolean>();
            expect(def).toBeDefined();
            
            const event = def()
            expect(event).toBeDefined();
            event(builder)

            expect(builder.calls).toEqual(1);
        });

        test('Must create a string event', () => {
            const builder = new MockBuilder();

            const def = eventOfType<string>();
            expect(def).toBeDefined();
            
            const event = def()
            expect(event).toBeDefined();
            event(builder)

            expect(builder.calls).toEqual(1);
        });

        test('Must create an Object event', () => {
            const builder = new MockBuilder();

            const def = eventOfType<Item[]>();
            expect(def).toBeDefined();
            
            const event = def()
            expect(event).toBeDefined();
            event(builder)

            expect(builder.calls).toEqual(1);
        });
    })

})
