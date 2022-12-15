import { Subject, Subscription } from "rxjs";

export type WorkflowEventEmitter<T> = (data: T) => void;
export type WorkflowEventHandlerCallback<T> = (data: T) => void;
export type WorkflowEventHandler<T> = (callback: WorkflowEventHandlerCallback<T>) => void;

export type WorkflowEvent<T> = { emit: WorkflowEventEmitter<T>; on: WorkflowEventHandler<T> };

export type WorkflowEventFactory<T> = () => WorkflowEvent<T>;

export type WorkflowEventDefinition<E> = {
    [K in keyof E]: WorkflowEvent<E[K]>;
}

type DefineEventOptions<T> = {
    name?: string;
}

// export function defineEvent<T>(options?: DefineEventOptions<T>) {
//     const factory: WorkflowEventFactory<T> = () => {
//         const subject = new Subject<T>;
//         const subscriptions: Subscription[] = [];

//         const event: WorkflowEvent<T> = {            
//             emit: (data) => {
//                 subject.next(data);
//             },
//             on: (handler) => {
//                 const subscription = subject.asObservable().subscribe(handler)
//                 subscriptions.push(subscription);
//             }
//         }
//         return event;
//     }
//     return factory;
// }

export function defineEvent<T>(options?: DefineEventOptions<T>) {
    const event : WorkflowEvent<T> = {
        emit: (data: T)=>{},
        on: (handler)=>{},
    }
    return event;
}