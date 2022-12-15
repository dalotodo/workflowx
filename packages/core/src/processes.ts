import { WorkflowEvent, WorkflowEventEmitter, WorkflowEventHandler } from "./events";

export type WorkflowProcessStartFunction<T> = () => T;
export type WorkflowProcessStopFunction<T> = () => T;

export type WorkflowProcess<T> = { 

    start: WorkflowProcessStartFunction<T>; 
    stop: WorkflowProcessStopFunction<T> 
}

export type WorkflowProcessEventContext<E> = { 
    emit: { [K in keyof E]: WorkflowEventEmitter<E[K]> };
    on: { [K in keyof E]: WorkflowEventHandler<E[K]> };
}

export type WorkflowProcessFactory<E,T> = (context: WorkflowProcessEventContext<E>) => WorkflowProcess<T>;

export type WorkflowProcessDefinition<E,P> = {
    [K in keyof P]: WorkflowProcessFactory<E,P[K]>;
}

type DefineProcessOptions<E,T> = {
    factory: WorkflowProcessFactory<E,T> 
}

export function defineProcess<E,T>( factory: WorkflowProcessFactory<E,T>  ) {   
    return factory;
}


export function defineJavascriptProcess<E>( callback: (ctx: WorkflowProcessEventContext<E>)=>void ) {
    const factory : WorkflowProcessFactory<E,void>  = (ctx)=> {
        const process : WorkflowProcess<void> = {
            start: ()=> {
                callback(ctx);
            },
            stop: () => {
                
            }
        }
        return process;
    }

    return factory;
}