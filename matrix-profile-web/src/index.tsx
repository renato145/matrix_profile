// A dependency graph that contains any wasm must all be imported
// asynchronously. This `index.js` file does the single async import, so
// that no one else needs to worry about it again.
import("./setup")
  .catch(e => console.error("Error importing `setup.tsx`:", e));

// Need to make this file a module
export {};
