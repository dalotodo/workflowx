import { defineEvent, defineJavascriptProcess, defineWorkflow } from "../src";

test('Basic workflow', () => {

    const wf = defineWorkflow({
        events: {
            start: defineEvent<boolean>(),
        },
        processes: {
            source: defineJavascriptProcess((ctx) => {   
                ctx.emit.start(true);
                ctx.on.start( ()=> {
                    
                })
            })
        }
    })


    expect(wf.events.start).toBeDefined();
    expect(wf.processes.source).toBeDefined();

});