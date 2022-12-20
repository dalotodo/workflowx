import { buildWorkflow, defineEvents, defineWorkflow, eventOfType } from '../src';


describe('Workflow Execution Tests', () => {

    test('Workflow runtime handles events', () => {
        const events = defineEvents({
            sample: eventOfType<string>(),
        });

        let expected: string = 'nothing';

        const wf = defineWorkflow({
            events,
            setup: (ctx, { defineProcess }) => {
                const main = defineProcess(() => {
                    ctx.on('sample', (value) => expected = value)
                })

                return { main };
            }
        });


        const sampleWorkflow = buildWorkflow(wf);

        const sample = sampleWorkflow();

        sample.events.sample.emit('sample01');
        expect(expected).toEqual('sample01');

        sample.events.sample.emit('sample02');
        expect(expected).toEqual('sample02');
    })


    test('Workflow recursion', () => {
        const events = defineEvents({
            start: eventOfType<number>(),
            calculate: eventOfType<number>(),
            result: eventOfType<number>(),
        });

        const wf = defineWorkflow({
            events,
            setup: (ctx, { defineProcess }) => {
                let result = 0;

                const main = defineProcess(() => {
                    ctx.on('start', (value) => {
                        ctx.emit('calculate', value);
                    })

                    ctx.on('calculate', (value) => {
                        if (value === 0) return ctx.emit('result', result);
                        result += value;
                        ctx.emit('calculate', value - 1);
                    })
                })

                return { main };
            }
        });

        const sampleWorkflow = buildWorkflow(wf);

        ((n: number) => {
            return new Promise<number>((resolve, reject) => {
                const sample = sampleWorkflow();
                sample.events.result.on((value) => resolve(value));
                sample.events.start.emit(n);
            })
        })(4).then((value) => {
            expect(value).toEqual(10)
        })
    })

})
