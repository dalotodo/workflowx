

export type WorkflowEventEmitter<T> = (data: T) => void;
export type WorkflowEventHandlerCallback<T> = (data: T) => void;
export type WorkflowEventHandler<T> = (callback: WorkflowEventHandlerCallback<T>) => void;

export interface WorkflowEvent<T> {
    emit: WorkflowEventEmitter<T>;
    on: WorkflowEventHandler<T>
};

// export type WorkflowEventFactory<T> = () => WorkflowEvent<T>;

export type WorkflowEventDefinition<E> = {
    [K in keyof E]: WorkflowEvent<E[K]>;
}

type DefineEventOptions<T> = {
    name?: string;
}


type WorkflowEventEmmiterDefition<E> = {
    [K in keyof E]: WorkflowEventEmitter<E[K]>;
}

export function defineEvent<T>(options?: DefineEventOptions<T>) {
    const callbacks: WorkflowEventHandlerCallback<T>[] = [];
    // Very simple event
    const event: WorkflowEvent<T> = {
        emit: (data: T) => callbacks.forEach(handler => handler(data)),
        on: (handler) => callbacks.push(handler),
    }
    return event;
}

export function defineEvents<E>(options: WorkflowEventDefinition<E>) {
    return options;
}

export function defineEmits<E>(events: WorkflowEventDefinition<E>) {
    const obj = Object.entries(events)
        .map(([k, v]) => ([k, v] as [string, WorkflowEvent<any>]))
        .reduce((prev, [k, e]) => {
            prev[k] = e.emit;
            return prev;
        }, {} as any)
    return obj as WorkflowEventEmmiterDefition<E>;
}

