import { Subject, Subscription } from "rxjs";

type IEventEmitter<T> = (...data: T[]) => void;
type IEventHandlerCallback<T> = (data: T) => void;
type IEventHandler<T> = (callback: IEventHandlerCallback<T>) => void;

export interface IEvent<T> extends IEventEmitter<T> {
  emit: IEventEmitter<T>;
  on: IEventHandler<T>;
}

export function defineEvent<T>() {
  const subject = new Subject<T>();
  const subscriptions: Subscription[] = [];

  const emitter: IEventEmitter<T> = (...data) =>
    (data || []).forEach((x) => subject.next(x));
  const handler: IEventHandler<T> = (callback) => {
    const subscription = subject.asObservable().subscribe(callback);
    subscriptions.push(subscription);
  };

  const event = (() => {
    const _f: any = (...data: T[]) => emitter(...data);
    _f.emit = emitter;
    _f.on = handler;
    return _f as IEvent<T>;
  })();
  return event;
}

export function defineHandler<T>(event: IEvent<T>, callback: IEventHandlerCallback<T> ) {
    event.on( callback );
}

type IProcess<T> = {
  execute: () => T;
};

export function defineProcess<T>(callback: () => T) {
  const process: IProcess<T> = {
    execute: callback,
  };
  return process;
}

type WorkflowDef<E, P> = {
  events: { [K in keyof E]: IEvent<E[K]> };
  processes: { [K in keyof P]: IProcess<P[K]> };
};

type WorkflowFactory<E, P> = () => WorkflowDef<E, P>;

type WorkflowExecutionContext = {
  runtime: { workflowId: string; executionId: string };
};

export function defineWorkflow<E, P>(
  setup: (context: WorkflowExecutionContext) => WorkflowDef<E, P>
): WorkflowFactory<E, P> {
  const workflowId: string = "wf";
  let executions: number = 0;

  const factory: WorkflowFactory<E, P> = () => {
    const executionId: string = `exec-${++executions}`;

    const context: WorkflowExecutionContext = {
      runtime: { workflowId, executionId },
    };

    const workflow: WorkflowDef<E, P> = setup(context);    

    // Init processes
    Object.keys(workflow.processes)
      .map((k) => k as keyof P)
      .forEach((k) => {
        workflow.processes[k].execute();
      });
    return workflow;
  };
  return factory;
}
