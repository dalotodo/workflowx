import { defineEvent, defineProcess, defineWorkflow } from "../../../src";
import { ClassifiedItem, Item } from "./models";

export const Warehouse =  defineWorkflow((ctx) => {
    
    const itemReceived = defineEvent<Item>();
    const itemClassified = defineEvent<ClassifiedItem>();

    const classifier = defineProcess(() => {        
        itemReceived.on((item) => {            
            // Send via DHL items less than 50Kg
            if (item.weight < 50.0) return itemClassified.emit({ ...item, agency: 'dhl' });
            return itemClassified.emit({ ...item, agency: 'dachser' });
        })
    });

    return {
        events: { itemReceived, itemClassified },
        processes: { classifier },
    }
})

