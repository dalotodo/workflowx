import { Subject, Subscription } from "rxjs";

export interface IRuntimeEventBuilder {
    buildEvent<T>(): RuntimeEvent<T>;
}

type RuntimeEventEmitter<T> = (data: T) => void;
type RuntimeEventHandlerCallback<T> = (data: T) => void;
type RuntimeEventHandler<T> = (callback: RuntimeEventHandlerCallback<T>) => void;

export type RuntimeEvent<T> = {
    emit: RuntimeEventEmitter<T>;
    on: RuntimeEventHandler<T>;
}

export type EventBuilderDelegate<T> = (builder: IRuntimeEventBuilder) => RuntimeEvent<T>;
export type EventDefinition<E> = { [K in keyof E]: EventBuilderDelegate<E[K]>; }

type EventDefinitionFactory<T> = () => EventBuilderDelegate<T>;
type DefineEventsOptions<E> = { [K in keyof E]: EventDefinitionFactory<E[K]>; }

export function defineEvents<E>(options: DefineEventsOptions<E>) {
    const obj = Object.entries(options)
        .map(([k, v]) => [k, v] as [string, EventDefinitionFactory<any>])
        .reduce((prev, [name, definition]) => {
            prev[name] = definition();
            return prev;
        }, {} as any);
    return obj as EventDefinition<E>;
}

export function eventOfType<T>(): EventDefinitionFactory<T> {
    const def = () => {
        const factory: EventBuilderDelegate<T> = (builder) => builder.buildEvent<T>();
        return factory;
    }
    return def;
}



type WorkflowEmitFunction<E> = <K extends keyof E>(eventName: K, data: E[K]) => void;
type WorkflowHandlerFunction<E> = <K extends keyof E>(eventName: K, handler: RuntimeEventHandlerCallback<E[K]>) => void;

type WorkflowFactoryContext<E> = {
    emit: WorkflowEmitFunction<E>;
    on: WorkflowHandlerFunction<E>;
}

type RuntimeEvents<E> = { [K in keyof E]: RuntimeEvent<E[K]>; }

type Workflow<E> = {
    events: RuntimeEvents<E>;
}

export type WorkflowFactoryCallback<E> = (context: WorkflowFactoryContext<E>) => void;


class EventBuilder<E> implements IRuntimeEventBuilder {


    build(defs: EventDefinition<E>) {
        const self = this;
        const obj = Object.entries(defs)
            .map(([k, v]) => [k, v] as [string, EventBuilderDelegate<any>])
            .reduce((prev, [name, factory]) => {
                prev[name] = factory(self);
                return prev;
            }, {} as any)
        return obj as RuntimeEvents<E>;
    }

    buildEvent<T>() {
        const subject = new Subject<T>();
        const subscriptions: Subscription[] = [];

        const event: RuntimeEvent<T> = {
            emit: (data) => subject.next(data),
            on: (callback) => {
                const s = subject.asObservable().subscribe(callback);
                subscriptions.push(s);
            }
        }
        return event;
    }

    emits(events: RuntimeEvents<E>) {
        const fn: WorkflowEmitFunction<E> = (name, data) => {
            const emit = events[name].emit;
            if (!emit) throw new Error(`Workflow has no event '${String(name)}'.`)
            events[name].emit(data);
        }
        return fn;
    }

    on(events: RuntimeEvents<E>) {
        const fn: WorkflowHandlerFunction<E> = (name, callback) => {
            const on = events[name].on;
            if (!on) throw new Error(`Workflow has no event handler for '${String(name)}'.`)
            events[name].on(callback);
        }
        return fn;
    }
}

export type WorkflowDef<E> = {
    events: EventDefinition<E>;
    setup: WorkflowFactoryCallback<E>;
}

export type WorkflowProcessDef<E> = {
    setup: WorkflowFactoryCallback<E>;
}

interface WorkflowSetupActions<E> {
    defineProcess(callback: () => void): WorkflowProcessDef<E>;
}



type ProcessDefinition<E, P> = { [K in keyof P]: WorkflowProcessDef<E>; }

export type DefineWorkflowOptions<E, P> = {
    events: EventDefinition<E>;
    setup: (context: WorkflowFactoryContext<E>, actions: WorkflowSetupActions<E> ) => ProcessDefinition<E, P>;
}

export function defineWorkflow<E, P>(options: DefineWorkflowOptions<E, P>): WorkflowDef<E> {
    const workflow: WorkflowDef<E> = {
        events: options.events,
        setup: (ctx: WorkflowFactoryContext<E>) => {
            

            const setupContext: WorkflowFactoryContext<E> = ctx;
            const setupActions: WorkflowSetupActions<E> = {
                defineProcess: (callback) => {
                    const process: WorkflowProcessDef<E> = {
                        setup: (ctx) => { callback(); }
                    }
                    return process;
                }
            }

            // Create internal processes
            const processes = options.setup(setupContext, setupActions);

            // Setup internal processes
            Object.values(processes)
                .map(p => p as WorkflowProcessDef<E>)
                .forEach(p => p.setup(ctx))
        }
    }
    return workflow;
}

export function buildWorkflow<E>(def: WorkflowDef<E>) {

    const factory = () => {
        const builder = new EventBuilder<E>();

        const events = builder.build(def.events);
        const emit = builder.emits(events);
        const on = builder.on(events);

        const ctx = { emit, on };
        const workflow: Workflow<E> = {
            events,
        };

        def.setup(ctx);

        return workflow;
    }

    return factory;
}