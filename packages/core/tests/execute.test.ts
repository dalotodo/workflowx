import { defineEvent, defineProcess, defineWorkflow } from '../src';


describe('Workflow Execution Tests', () => {

    test('Workflow runtime handles events', () => {
        

        let expected: string = 'nothing';

        const SampleWorkflow = defineWorkflow( (ctx)=> {
            const sample = defineEvent<string>();
            
            const main = defineProcess(() => {
                sample.on( (value) => expected = value )
            })

            return { 
                events: {sample},
                processes: { main }
            };            
        });
        

        const sample = SampleWorkflow();

        sample.events.sample.emit('sample01');
        expect(expected).toEqual('sample01');

        sample.events.sample.emit('sample02');
        expect(expected).toEqual('sample02');
    })


    it('should calculate using self calls to an event', async () => {
        const SampleWorkflow = defineWorkflow((ctx) => {

            const start = defineEvent<number>();
            const calculate = defineEvent<number>();
            const result = defineEvent<number>();


            let current = 0;

            const main = defineProcess(() => {
                start.on((value) => {
                    calculate.emit(value);
                })

                calculate.on((value) => {
                    if (value === 0) return result.emit(current);
                    current += value;
                    calculate.emit(value - 1);
                })
            });


            return {
                events: { start, result },
                processes: { main }
            };
        });

        const calculate = (n: number) => {
            return new Promise<number>((resolve, reject) => {
                const sample = SampleWorkflow();
                sample.events.result.on((value) => resolve(value));
                sample.events.start.emit(n);
            });
        }

        expect(await calculate(4)).toEqual(10);
        expect(await calculate(5)).toEqual(15);

    })

})
