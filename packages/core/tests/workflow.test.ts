import { defineEmits, defineEvent, defineEvents, defineProcess, defineWorkflow } from '../src'

test('Basic workflow', () => {
    type Item = { id: string; name: string; }

    const events = defineEvents( {
        start: defineEvent<boolean>(),
        isValidData: defineEvent<Item[]>(),
    })

    const emit = defineEmits(events);    

    const main = defineProcess(events, (ctx)=> {
        ctx.on('start', (data)=> {
            ctx.emit('isValidData', [{id: 'ok', name: 'Is ok'}]);
        })
        
    });        

    const wf = defineWorkflow({
        events,
        processes: {
            main
        }
    })

    expect(wf.events.start).toBeDefined();
    expect(wf.processes.main).toBeDefined();

});

