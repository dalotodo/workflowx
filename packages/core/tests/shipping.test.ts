import { buildWorkflow, defineEvents, defineWorkflow, eventOfType } from "../src"


test('Shipping dispatch test', ()=> {

    type Item = {
        id: string;
        weight: number;
    }

    type ClassifiedItem = Item & { agency: string };

    const events = defineEvents( {
        itemReceived: eventOfType<Item>(),
        itemClassified: eventOfType<ClassifiedItem>(),

        'dhl:send': eventOfType<ClassifiedItem>(),
        'dhl:query': eventOfType<void>(),
        'dhl:available': eventOfType<ClassifiedItem[]>(),

        // Don't know that to do with it
        setAsPending: eventOfType<ClassifiedItem>(),
    })

    const wf = defineWorkflow( {
        events, 
        setup: ({ emit, on }, { defineProcess })=> {
            const classifier = defineProcess( ()=> {
                on('itemReceived', (item)=> {
                    // Send via DHL items less than 50Kg
                    if (item.weight<50.0) return emit('itemClassified', { ...item, agency: 'dhl' } );
                    return emit('itemClassified', { ...item, agency: 'unknown'} );
                })                
            })

            const dispatcher = defineProcess( ()=> {
                on('itemClassified', (item)=> {
                    if (item.agency==='dhl') return emit('dhl:send', item);
                    return emit('setAsPending', item);
                })
            })

            const dhlDock = defineProcess( ()=> {
                const queue : ClassifiedItem[] = [];
                on('dhl:send', (item)=> {
                    queue.push(item);
                })

                on('dhl:query', ()=> emit('dhl:available', queue));
            })

            return { classifier, dispatcher, dhlDock }
        }
    })

    const ShippingWorkbench = buildWorkflow(wf);
    const wb1 = ShippingWorkbench();

    let itemsToServe : string[] = [];
    wb1.events["dhl:available"].on( (items)=> itemsToServe.push(...items.map(x=>x.id)) );

    wb1.events.itemReceived.emit({ id: 'item-001', weight: 20.0 });
    wb1.events.itemReceived.emit({ id: 'item-002', weight: 18.0 });
    wb1.events.itemReceived.emit({ id: 'item-003', weight: 55.0 });
    
    wb1.events["dhl:query"].emit();
    
    expect(itemsToServe).toEqual(['item-001', 'item-002'])

})