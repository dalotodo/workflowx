import { buildWorkflow, defineEvents, defineWorkflow, eventOfType } from "../src";


test('Basic workflow', () => {
    
    const events = defineEvents({
        expect: eventOfType<string>(),
        test: eventOfType<string>(),
    });

    const wf = defineWorkflow({
        events,
        setup: (ctx) => {
            let expected: string;
            ctx.on('expect', (value) => expected = value)

            ctx.on('test', (value) => {
                expect(value).toEqual(expected);
            })
        }
    });


    const sampleWorkflow = buildWorkflow(wf);

    const sample1 = sampleWorkflow();
    const sample2 = sampleWorkflow();

    expect(sample1).toBeDefined();
    expect(sample1.events.expect).toBeDefined();
    expect(sample1.events.test).toBeDefined();    

    expect(sample2).toBeDefined();
    expect(sample2.events.expect).toBeDefined();
    expect(sample2.events.test).toBeDefined();

    expect(sample1.events.expect).not.toBe(sample2.events.expect);
    expect(sample1.events.test).not.toBe(sample2.events.test);

});

