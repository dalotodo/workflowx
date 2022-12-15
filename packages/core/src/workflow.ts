
import { WorkflowEventDefinition } from "./events";
import { WorkflowProcessDefinition } from "./processes";

export type WorkflowDefinition<E, P> = {    
    events: WorkflowEventDefinition<E>;
    processes: WorkflowProcessDefinition<E, P>;
}   

export function defineWorkflow<E, P>(definition: WorkflowDefinition<E, P>) {
    return definition;
}
