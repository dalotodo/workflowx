import { defineEvent, defineHandler, defineWorkflow } from "../../../src";

type ValidateFunction<T> = (item: T)=>boolean;

export function createValidator<T>() {
    const Workflow = defineWorkflow( ()=> {
        const _validators : ValidateFunction<T>[] = [];

        const addValidator = defineEvent<ValidateFunction<T>>();
        const validate = defineEvent<T>();
        const isValid = defineEvent<T>();
        const isInvalid = defineEvent<T>();

        defineHandler(addValidator, (validator)=> _validators.push(validator));
        defineHandler(validate, (item)=> {
            const _isValid = _validators.every( v=>v(item) );
            if (_isValid) { return isValid(item) }
            else { return isInvalid(item) }
        })

        return {
            events: { addValidator, validate, isValid, isInvalid },
            processes: {}
        }
    })
    return Workflow();
}