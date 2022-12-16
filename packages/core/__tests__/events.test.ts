import { defineEmits, defineEvent, defineEvents, defineProcess, defineWorkflow } from "../src";

describe('Core Events', ()=> {
    describe('defineEvent', ()=> {
        type Item = { id: string; name: string }

        test('Must create a boolean event', ()=>{
            const event = defineEvent<boolean>();            
            expect(event).toBeDefined();
            expect(event.emit).toBeDefined();
            expect(event.on).toBeDefined();

            const value = true;

            event.on( (data)=>expect(data).toEqual(value) );
            event.emit(value);
        });

        test('Must create a string event', ()=>{
            const event = defineEvent<string>();
            expect(event).toBeDefined();
            expect(event.emit).toBeDefined();
            expect(event.on).toBeDefined();

            const value = 'sample';

            event.on( (data)=>expect(data).toEqual(value) );
            event.emit(value);
        });

        test('Must create an Object event', ()=>{
            const event = defineEvent<Item>();
            expect(event).toBeDefined();
            expect(event.emit).toBeDefined();
            expect(event.on).toBeDefined();

            const value : Item = { id: 'sample', name: 'Sample' };

            event.on( (data)=>expect(data).toEqual(value) );
            event.emit(value);
        });
    })

})
