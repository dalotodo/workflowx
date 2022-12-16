import { WorkflowEventDefinition, WorkflowEventEmitter } from "./events";

export type WorkflowProcessEventHandlerContext<E> = { 
    emit: { [K in keyof E]: WorkflowEventEmitter<E[K]> };    
}

export type WorkflowProcessEventHandler<E,T> = (data: T, ctx: WorkflowProcessEventHandlerContext<E>)=>void;

export type WorkflowProcess<E> = { 
    [K in keyof E]+?: WorkflowProcessEventHandler<E,E[K]>;
}

export type WorkflowProcessDefinition<E,P> = {
    [K in keyof P]: WorkflowProcess<E>;
}

type DefineProcessOptions<E> = {
    [K in keyof E]+?: WorkflowProcessEventHandler<E,E[K]>;
}

export function defineProcess<E>(events: WorkflowEventDefinition<E>, options: DefineProcessOptions<E> ) {
    return options as WorkflowProcess<E>;
}

