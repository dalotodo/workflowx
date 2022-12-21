import { Subject, Subscription } from "rxjs"

type IEventEmitter<T> = (...data: T[])=>void;
type IEventHandlerCallback<T> = (data: T) => void;
type IEventHandler<T> = (callback: IEventHandlerCallback<T>)=>void;

interface IEvent<T> {
    emit: IEventEmitter<T>;
    on: IEventHandler<T>;
}

export function defineEvent<T>() {
    const subject = new Subject<T>();
    const subscriptions: Subscription[] = [];

    const event: IEvent<T> = {
        emit: (...data) => (data||[]).forEach( x=>subject.next(x) ),
        on: (handler: IEventHandlerCallback<T>) => {
            const subscription = subject.asObservable().subscribe(handler);
            subscriptions.push(subscription);
        }
    }
    return event;
}

type IProcess<T> = {
    execute: () => T;
}

export function defineProcess<T>( callback: ()=>T ) {
    const process: IProcess<T> = {
        execute: callback,
    }
    return process;
}

type WorkflowDef<E, P> = {
    events: { [K in keyof E]: IEvent<E[K]>; },
    processes: { [K in keyof P]: IProcess<P[K]>; },
}

type WorkflowFactory<E,P> = ()=>WorkflowDef<E,P>;

type WorkflowExecutionContext = {
    runtime: { workflowId: string; executionId: string; }
}

export function defineWorkflow<E, P>(setup: (context: WorkflowExecutionContext) => WorkflowDef<E, P>): WorkflowFactory<E,P> {
    const workflowId : string = 'wf';
    let executions : number = 0;

    const factory : WorkflowFactory<E,P> = () => {        
        const executionId : string = `exec-${++executions}`;

        const context : WorkflowExecutionContext = { runtime: { workflowId, executionId } }

        const workflow: WorkflowDef<E, P> = setup(context);

        // Init processes
        Object.keys(workflow.processes).map(k=>k as keyof P).forEach( k=> {
            workflow.processes[k].execute();
        })
        return workflow;
    }
    return factory;
}