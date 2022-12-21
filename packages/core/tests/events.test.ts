import { defineEvent } from "../src";


describe('Core Events', () => {
    describe('defineEvent', () => {
        type Item = { id: string; name: string }

        test('Must create a boolean event', () => {
            const fn = jest.fn( (value: boolean)=> {} )

            const event = defineEvent<boolean>();

            expect(event).toBeDefined();
            expect(event.emit).toBeDefined();
            expect(event.on).toBeDefined();

            const value = true
            event.on( fn )
            event.emit(value);

            expect(fn).toBeCalledWith(value)            
        });

        test('Must create a string event', () => {
            const fn = jest.fn( (value: string)=> {} )

            const event = defineEvent<string>();

            expect(event).toBeDefined();
            expect(event.emit).toBeDefined();
            expect(event.on).toBeDefined();

            const value = 'hello'
            event.on( fn )
            event.emit(value);

            expect(fn).toBeCalledWith(value)            
        });

        test('Must create an Object event', () => {
            const fn = jest.fn( (value: Item)=> {} )

            const event = defineEvent<Item>();

            expect(event).toBeDefined();
            expect(event.emit).toBeDefined();
            expect(event.on).toBeDefined();

            const value : Item = { id: '1', name: 'Item #1'}
            event.on( fn )
            event.emit(value);

            expect(fn).toBeCalledWith(value)            
        });

    })

})
