import { buildWorkflow, defineEvents, defineWorkflow, eventOfType } from "../src";

test('Import workflow sample test', () => {
    type Item = { id: string; name: string; }

    const events = defineEvents({        
        // readItems => Items are read
        readItems: eventOfType<Item[]>(),

        // isItemValid => Item is valid
        itemIsValid: eventOfType<Item>(),
        itemIsInvalid: eventOfType<Item>(),

        // saveItem => Save item
        saveItem: eventOfType<Item>(),        
    });


    const wf = defineWorkflow({
        events,
        setup: (ctx, { defineProcess }) => {
            const validator = defineProcess( () => {
                const isValid = (item: Item) => item.id.length<=5;
                ctx.on('readItems', (items) => {
                    items.forEach( (item)=>{
                        if (isValid(item)) return ctx.emit('itemIsValid', item);
                        return ctx.emit('itemIsInvalid', item);
                    } )
                });
            });

            const store = defineProcess( ()=> {
                ctx.on('itemIsValid', (item)=> {
                    ctx.emit('saveItem', item);
                })

                ctx.on('itemIsInvalid', (item)=> {
                    // Discard
                })
            });                   

            return { validator, store };
        }
    });

    const ItemValidator = buildWorkflow(wf);

    const validator = ItemValidator();

    const savedItems : string[] = [];
    validator.events.saveItem.on(item=>savedItems.push(item.id));
    validator.events.readItems.emit( [
        { id: 'id000', name: 'This item is valid' },
        { id: 'id001', name: 'This item is valid' },
        { id: 'id001-b', name: 'This item is invalid' },
        { id: 'id001-c', name: 'This item is invalid' },
        { id: 'id002', name: 'This item is valid' },
    ])

    expect(savedItems).toEqual(['id000','id001','id002'])        
})