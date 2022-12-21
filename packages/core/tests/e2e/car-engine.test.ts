import { defineEvent, defineProcess, defineWorkflow } from "../../src";

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
            isBreakPedalPushed.on((hardness) => {
                // Convert hardness from sensor 
                if (hardness >= 10) {
                    return changeSpeed.emit(-speed);
                } else {
                    return changeSpeed.emit(-hardness);
                }
            })
        })

        const accelPedalSensor = defineProcess(() => {
            isAccelPedalPushed.on((hardness) => {
                changeSpeed.emit(hardness);
            });
        })

        const main = defineProcess(() => {
            start.on(() => {
                speed = 0;
            });

            changeSpeed.on((increment) => {
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
    car.events.displaySpeed.on((newValue) => {
        speeds.push(newValue);
    })
    car.events.start.emit();

    car.events.isAccelPedalPushed.emit(1); // Speed = 1
    car.events.isAccelPedalPushed.emit(2); // Speed = 3 
    car.events.isAccelPedalPushed.emit(4); // Speed = 7        

    car.events.isBreakPedalPushed.emit(2); // Speed = 5
    car.events.isBreakPedalPushed.emit(12); // BREAK!! Speed = 0
    expect(speeds).toEqual([1, 3, 7, 5, 0])
})