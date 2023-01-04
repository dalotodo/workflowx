import {
  defineEvent,
  defineHandler,
  defineProcess,
  defineWorkflow,
} from "../src";

describe("Async Workflows", () => {
  it("Should be running asynchronously", async () => {
    const SampleWorkflow = defineWorkflow((ctx) => {
      const start = defineEvent<boolean>();
      const stop = defineEvent<boolean>();

      const main = defineProcess(() => {        
        defineHandler(stop, () => {
          // Cleanup
        });
      });

      return {
        events: { start, stop },
        processes: { main },
      };
    });

    const runWorkflow = () => {
      const wf = SampleWorkflow();
      const p = new Promise<void>((resolve, reject) => {
        defineHandler(wf.events.stop, () => {
          resolve();
        });
      });

      wf.events.start(true);

      setTimeout(() => wf.events.stop(true), 3000);

      return p;
    };

    await runWorkflow();
  });
});
