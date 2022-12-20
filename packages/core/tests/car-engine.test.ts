import { buildWorkflow, defineEvents, defineWorkflow, eventOfType } from "../src";

test('Car engine simulation', () => {
    const events = defineEvents({
        // Start engine
        start: eventOfType<boolean>(),

        // changeSpeed for engine
        changeSpeed: eventOfType<number>(),

        // displaySpeed in the Odometer
        displaySpeed: eventOfType<number>(),

        // is Accelerator Pedal pushed (level of hardness)?
        isAccelPedalPushed: eventOfType<number>(),

        // is Break Pedal pushed (level of hardness)?
        isBreakPedalPushed: eventOfType<number>(),
    });


    const wf = defineWorkflow({
        events,
        setup: (ctx, { defineProcess }) => {

            let speed = 0;

            const brakePedalSensor = defineProcess( () => {
                ctx.on('isBreakPedalPushed', (hardness) => {
                    // Convert hardness from sensor 
                    if (hardness >= 10) {
                        return ctx.emit('changeSpeed', -speed);
                    } else {
                        return ctx.emit('changeSpeed', -hardness);
                    }
                })
            })

            const accelPedalSensor = defineProcess(() => {
                ctx.on('isAccelPedalPushed', (hardness) => {
                    ctx.emit('changeSpeed', hardness);
                })
            })

            const main = defineProcess(() => {
                ctx.on('start', (isStarted) => {
                    speed = 0;
                })

                ctx.on('changeSpeed', (increment) => {
                    speed += increment;
                    ctx.emit('displaySpeed', speed);          
                })
            })

            return { main, accelPedalSensor, brakePedalSensor };
        }
    });

    const drivingCar = buildWorkflow(wf);

    const car = drivingCar();

    let speeds : number[] = [];
    car.events.displaySpeed.on((newValue) => {
        speeds.push(newValue);
    })
    car.events.start.emit(true);

    car.events.isAccelPedalPushed.emit(1); // Speed = 1
    car.events.isAccelPedalPushed.emit(2); // Speed = 3 
    car.events.isAccelPedalPushed.emit(4); // Speed = 7        

    car.events.isBreakPedalPushed.emit(2); // Speed = 5
    car.events.isBreakPedalPushed.emit(12); // BREAK!! Speed = 0
    expect(speeds).toEqual([1,3,7,5,0])        
})