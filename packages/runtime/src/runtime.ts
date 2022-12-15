import { WorkflowDefinition, WorkflowEvent, WorkflowEventDefinition, WorkflowEventFactory, WorkflowProcess, WorkflowProcessDefinition, WorkflowProcessEventContext, WorkflowProcessFactory } from '@workflowx/core'

type WorkflowEventRuntime<E> = { [K in keyof E]: WorkflowEvent<E[K]>; }

type WorkflowProcessRuntime<P> = { [K in keyof P]: WorkflowProcess<P[K]>; }

type RuntimeWorkflow<E, P> = {    
    events: WorkflowEventRuntime<E>;
    processes: WorkflowProcessRuntime<P>;    
}


function _buildEvents<T>(collection: WorkflowEventDefinition<T>) {
    const obj = Object.entries(collection).map(([key, eventFactory]) => {
        const value = eventFactory as WorkflowEventFactory<any>;
        return [key, value] as [string, WorkflowEventFactory<any>];
    }).reduce((prev, current) => {
        const [key, factory] = current;
        prev[key] = factory();
        return prev;
    }, {} as any)
    return obj as WorkflowEventRuntime<T>;
}

function _buildProcessEventContext<E>(events: WorkflowEventRuntime<E>): WorkflowProcessEventContext<E> {
    return events;
}

function _buildProcesses<E,P>(events: WorkflowEventRuntime<E>, collection: WorkflowProcessDefinition<E,P>) {
    const context = _buildProcessEventContext(events);

    const obj = Object.entries(collection).map(([key, eventFactory]) => {
        const value = eventFactory as WorkflowProcessFactory<E,any>;
        return [key, value] as [string, WorkflowProcessFactory<E,any>];
    }).reduce((prev, current) => {
        const [key, factory] = current;
        prev[key] = factory(context);
        return prev;
    }, {} as any)
    return obj as WorkflowProcessRuntime<P>;
}

type WorkflowStartFunction<E,P> = (runtime: RuntimeWorkflow<E,P>)=>void;
type RuntimeWorkflowExecutable<E,P> = {
    runtime: RuntimeWorkflow<E,P>;
    start: () => void;
}

type BuildWorkflowOptions<E,P> = {    
    start: WorkflowStartFunction<E,P>;
}

export function buildWorkflow<E, P>(workflow: WorkflowDefinition<E,P>, options?: BuildWorkflowOptions<E,P> ): RuntimeWorkflowExecutable<E, P> {
    const events = _buildEvents(workflow.events);
    const processes = _buildProcesses(events, workflow.processes);

    const runtime : RuntimeWorkflow<E,P> = { 
        events, 
        processes,      
    };

    const executable : RuntimeWorkflowExecutable<E,P> = {
        runtime,
        start: ()=> {
            const startup = Object.entries(processes).map( ([key,p])=> (p as WorkflowProcess<any>) );
            startup.forEach(p=>p.start())            
            options.start(runtime);
        }
    }

    return executable;    
}
