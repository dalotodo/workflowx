import { defineEvent, defineProcess, defineWorkflow } from "../../../src";
import { ClassifiedItem } from "./models";

export const Dock = defineWorkflow((ctx) => {
    const config = defineEvent<string>();
    const isConfigured = defineEvent<boolean>();

    const send = defineEvent<ClassifiedItem>();
    const query = defineEvent<boolean>();
    const stock = defineEvent<ClassifiedItem[]>();

    let _agency: string = '';
    const _stock: ClassifiedItem[] = [];

    const configurator = defineProcess(() => {
        config.on( (value) => {            
            _agency = value
            isConfigured.emit(true);
        });

        // When query is requested, reply with the stock        
        query.on(() => {
            stock.emit(_stock)
        });
    })        

    const main = defineProcess(() => {
        // Only add those items that match the given agency
        send.on((item) => (item.agency === _agency) && _stock.push(item) );
    })

    return {
        events: { config, isConfigured, send, query, stock },
        processes: { configurator, main }
    }
});

export function createDock(agency: string) {
    const dock = Dock();
    return new Promise<typeof dock>((resolve, reject) => {            
        dock.events.isConfigured.on( () => {            
            resolve(dock)
        })
        dock.events.config.emit(agency);
    })
};

