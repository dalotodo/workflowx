import { WorkflowEvent } from '@workflowx/core'

export function createEvent<T>(event: WorkflowEvent<T>) {
    const factory: WorkflowEventFactory<T> = () => {
        const subject = new Subject<T>;
        const subscriptions: Subscription[] = [];

        const event: WorkflowEvent<T> = {            
            emit: (data) => {
                subject.next(data);
            },
            on: (handler) => {
                const subscription = subject.asObservable().subscribe(handler)
                subscriptions.push(subscription);
            }
        }
        return event;
    }
    return factory;
}

