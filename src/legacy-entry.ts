import { createLegacyGlobals } from "./legacy-globals.js";
import { getDefaultModal } from "./index.js";
import { setDefaultsProvider, TriggerModel } from "./types.js";

const instance = getDefaultModal();

setDefaultsProvider(() => instance.defaults);

const globals = createLegacyGlobals(instance);

const g = globalThis as typeof globalThis & {
  CXmodel?: typeof TriggerModel;
  CXview?: (typeof globals)["CXview"];
  CXcontrol?: (typeof globals)["CXcontrol"];
};

g.CXmodel = globals.CXmodel;
g.CXview = globals.CXview;
g.CXcontrol = globals.CXcontrol;

export default globals;
