import { defineEvent, defineJavascriptProcess, defineWorkflow } from "../src";

test('Basic workflow', () => {

    const wf = defineWorkflow({
        events: {
            start: defineEvent<boolean>(),
        },
        processes: {
            source: defineJavascriptProcess((ctx) => {
            })
        }
    })


    expect(wf.events.start).toBeDefined();
    expect(wf.processes.source).toBeDefined();

});