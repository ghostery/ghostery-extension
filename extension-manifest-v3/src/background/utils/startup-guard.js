export default (starter, stopper) => {
  let resolver, rejecter, init;
  let isPending = true;
  const reset = () => {
    isPending = true;
    init = new Promise((resolve, reject) => {
      resolver = () => {
        resolve();
        isPending = false;
      };
      rejecter = () => {
        reject();
        isPending = false;
      };
    });
  };
  reset();
  return {
    start() {
      if (!isPending) {
        reset();
      }
      (async () => {
        try {
          await starter();
          resolver();
        } catch (e) {
          rejecter();
          console.error(e);
        }
      })();
    },
    stop() {
      if (!isPending) {
        reset();
      }
      rejecter();
      (async () => {
        try {
          await stopper();
        } catch (e) {
          console.error(e);
        }
      })();
    },
    isReady({ timeout, errorMessage }) {
      if (!isPending) {
        return init;
      }
      return Promise.race([
        init,
        new Promise((_, rej) => setTimeout(() => rej(errorMessage), timeout)),
      ]);
    },
  };
};
