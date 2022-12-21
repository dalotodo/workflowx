import { defineEvent, defineProcess, defineWorkflow } from "../src";


test('Simple Workflow definition', () => {

    let result : string = '';

    const SimpleWorkflow = defineWorkflow( (ctx) => {        
        const simple = defineEvent<string>();

        const main = defineProcess( () => {            
            simple.on( (value) => {
                result = value;
            })
        });

        return {
            events: { simple },
            processes: { main }
        };
    });

    const simple1 = SimpleWorkflow();
    const simple2 = SimpleWorkflow();

    expect(simple1.events.simple).not.toBe(simple2.events.simple);
    
    const message = 'Hello, World!'
    simple1.events.simple.emit(message)
    expect(result).toEqual(message)

})
