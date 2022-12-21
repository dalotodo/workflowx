
import { Dock, createDock } from "./dock";
import { Item } from "./models";
import { Warehouse } from "./warehouse"

jest.useRealTimers();

describe('Shipping Workbench', ()=>{
       
    it('should dispatch items correctly', async () => {        
        const dhl = await createDock('dhl');
        const dachser = await createDock('dachser');    
    
        const wb1 = Warehouse();
        wb1.events.itemClassified.on((item) => dhl.events.send.emit(item))
        wb1.events.itemClassified.on((item) => dachser.events.send.emit(item))
            
        const items: Item[] = [
            { id: 'item-001', weight: 20.0 },
            { id: 'item-002', weight: 18.0 },
            { id: 'item-003', weight: 55.0 }
        ];
    
        wb1.events.itemReceived.emit(...items);
        
        const itemsInDhl = () => {
            return new Promise<string[]>((resolve, reject) => {
                dhl.events.stock.on((items) => resolve(items.map(x => x.id)));
                dhl.events.query.emit(true);
            })            
        }
    
        const itemsInDachser = () => new Promise<string[]>((resolve, reject) => {            
            dachser.events.stock.on((items) => resolve(items.map(x => x.id)));
            dachser.events.query.emit(true);
        })        
    
        expect( (await itemsInDhl()) ).toEqual(['item-001', 'item-002'])
        expect( (await itemsInDachser()) ).toEqual(['item-003'])
    
    }, 10000)

})

