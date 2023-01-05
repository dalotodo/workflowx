
import { defineHandler } from "../../../src";
import { Dock, createDock } from "./dock";
import { Item } from "./models";
import { Warehouse } from "./warehouse"

jest.useRealTimers();

describe('Shipping Workbench', () => {

    it('should dispatch items correctly', async () => {
        const dhl = await createDock('dhl');
        const dachser = await createDock('dachser');

        const wb1 = Warehouse();
        const docks = [dhl, dachser];
        defineHandler(wb1.events.itemClassified, (item) => docks.forEach((dock) => dock.events.send(item)))

        const items: Item[] = [
            { id: 'item-001', weight: 20.0 },
            { id: 'item-002', weight: 18.0 },
            { id: 'item-003', weight: 55.0 }
        ];

        wb1.events.itemReceived(...items);

        const itemsInDhl = () => {
            return new Promise<string[]>((resolve, reject) => {
                defineHandler(dhl.events.stock, (items) => resolve(items.map(x => x.id)));
                dhl.events.query(true);
            })
        }

        const itemsInDachser = () => new Promise<string[]>((resolve, reject) => {
            defineHandler(dachser.events.stock, (items) => resolve(items.map(x => x.id)));
            dachser.events.query(true);
        })

        expect((await itemsInDhl())).toEqual(['item-001', 'item-002'])
        expect((await itemsInDachser())).toEqual(['item-003'])

    }, 10000)

})

