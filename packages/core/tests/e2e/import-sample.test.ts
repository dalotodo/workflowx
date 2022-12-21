import { defineEvent, defineProcess, defineWorkflow } from "../../src";

test('Import workflow sample test', () => {
    type Item = { id: string; name: string; }

    const ItemValidator = defineWorkflow((ctx) => {

        const readItems = defineEvent<Item[]>();
        const itemIsValid = defineEvent<Item>();
        const itemIsNotValid = defineEvent<Item>();
        const saveItem = defineEvent<Item>();

        const validator = defineProcess(() => {
            const isValid = (item: Item) => item.id.length <= 5;
            readItems.on((items) => {

                items.forEach((item) => {
                    if (isValid(item)) return itemIsValid.emit(item);
                    return itemIsNotValid.emit(item);
                })
            });
        });

        const store = defineProcess(() => {
            itemIsValid.on((item) => saveItem.emit(item));
            itemIsNotValid.on((item) => { /* Discard */ } );
        });

        return {
            events: { readItems, saveItem },
            processes: { validator, store }
        }
    });


    const validator = ItemValidator();

    const savedItems: string[] = [];
    validator.events.saveItem.on(item => savedItems.push(item.id));
    validator.events.readItems.emit([
        { id: 'id000', name: 'This item is valid' },
        { id: 'id001', name: 'This item is valid' },
        { id: 'id001-b', name: 'This item is invalid' },
        { id: 'id001-c', name: 'This item is invalid' },
        { id: 'id002', name: 'This item is valid' },
    ])

    expect(savedItems).toEqual(['id000', 'id001', 'id002'])
})