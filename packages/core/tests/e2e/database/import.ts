import { defineEvent, defineHandler, defineWorkflow } from "../../../src";

type ValidateFunction<T> = (item: T)=>boolean;

export function createImport<T>(validate: ValidateFunction<T> ) {
  const ImportWorkflow = defineWorkflow( (ctx) => {
    const addItem = defineEvent<T>();
    const isValid = defineEvent<T>();
    const isInvalid = defineEvent<T>();

    defineHandler(addItem, (item) => {
        // Check if item is valid
        if (validate(item)) {
            return isValid(item);
        } else {
            return isInvalid(item);
        }
    })

    return {
        events: { addItem },
        processes: {},
    }
  });

  return ImportWorkflow();
}
