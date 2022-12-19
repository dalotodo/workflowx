import { WorkflowEvent, WorkflowEventDefinition, WorkflowEventEmitter } from "./events";

export type WorkflowProcessEventHandlerContext<E> = { 
    emit: { [K in keyof E]: WorkflowEventEmitter<E[K]> };    
}

export type WorkflowProcessEventHandler<E,T> = (data: T, ctx: WorkflowProcessEventHandlerContext<E>)=>void;

export type WorkflowProcess<E> = { 
    [K in keyof E]+?: WorkflowProcessEventHandler<E,E[K]>;
}

export type WorkflowProcessDefinition<E,P> = {
    [K in keyof P]: WorkflowProcessFactory<E>;
}

// type DefineProcessOptions<E> = {
//     [K in keyof E]+?: WorkflowProcessEventHandler<E,E[K]>;
// }



type WorkflowProcessFactory<E> = {
    (ctx: WorkflowProcessDefinitionContext<E>): void;
}

type WorkflowProcessDefinitionContext<E> = {
    // events: WorkflowEventDefinition<E>;
    emit<K extends keyof E>(eventName:  K, data: E[K]): void;
    on<K extends keyof E>(eventName:  K, handler: WorkflowProcessEventHandler<E,E[K]>): void;
}


export function defineProcess<E>(events: WorkflowEventDefinition<E>, callback: WorkflowProcessFactory<E> ) {

    return callback;
}

