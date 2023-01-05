import { defineEvent, defineHandler, defineProcess, defineWorkflow } from "../../src";

test('Car engine simulation', () => {

    const CarEngine = defineWorkflow((ctx) => {
        // Start engine
        const start = defineEvent<void>();
        // changeSpeed for engine
        const changeSpeed = defineEvent<number>();
        // displaySpeed in the Odometer
        const displaySpeed = defineEvent<number>();
        // is Accelerator Pedal pushed (level of hardness)?
        const isAccelPedalPushed = defineEvent<number>();
        // is Break Pedal pushed (level of hardness)?
        const isBreakPedalPushed = defineEvent<number>();

        let speed = 0;

        const brakePedalSensor = defineProcess(() => {
            defineHandler(isBreakPedalPushed, (hardness) => {
                // Convert hardness from sensor 
                if (hardness >= 10) {
                    return changeSpeed.emit(-speed);
                } else {
                    return changeSpeed.emit(-hardness);
                }
            })
        })

        const accelPedalSensor = defineProcess(() => {
            defineHandler( isAccelPedalPushed, (hardness) => {
                changeSpeed.emit(hardness);
            });
        })

        const main = defineProcess(() => {
            defineHandler( start, () => {
                speed = 0;
            });

            defineHandler( changeSpeed, (increment) => {
                speed += increment;
                displaySpeed.emit(speed);
            })
        })

        return {
            events: { start, isAccelPedalPushed, isBreakPedalPushed, displaySpeed },
            processes: { main, accelPedalSensor, brakePedalSensor }
        };
    }
    );


    const car = CarEngine();

    let speeds: number[] = [];
    defineHandler( car.events.displaySpeed, (newValue) => {
        speeds.push(newValue);
    })
    car.events.start();

    car.events.isAccelPedalPushed(1); // Speed = 1
    car.events.isAccelPedalPushed(2); // Speed = 3 
    car.events.isAccelPedalPushed(4); // Speed = 7        

    car.events.isBreakPedalPushed(2); // Speed = 5
    car.events.isBreakPedalPushed(12); // BREAK!! Speed = 0
    expect(speeds).toEqual([1, 3, 7, 5, 0])
})