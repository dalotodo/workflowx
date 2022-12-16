import { defineEmits, defineEvent, defineEvents, defineProcess, defineWorkflow } from "../src";

test('Basic workflow', () => {
    type Item = { id: string; name: string; }

    const events = defineEvents( {
        start: defineEvent<boolean>(),
        isValidData: defineEvent<Item[]>(),
    })

    const emit = defineEmits(events);    

    const source = defineProcess(events, {
        start: (data, ctx)=> {            
        },        
    });        

    const wf = defineWorkflow({
        events,
        processes: {
            source
        }
    })


    expect(wf.events.start).toBeDefined();
    expect(wf.processes.source).toBeDefined();

});