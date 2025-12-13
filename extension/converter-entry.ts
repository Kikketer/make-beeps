import {
  convertBeepBoxToMakeCode as _convertBeepBoxToMakeCode,
  generatePasteJSON as _generatePasteJSON,
} from "../src/converter";

const g = globalThis;
(g as unknown as Record<string, unknown>).convertBeepBoxToMakeCode = _convertBeepBoxToMakeCode;
(g as unknown as Record<string, unknown>).generatePasteJSON = _generatePasteJSON;

export { _convertBeepBoxToMakeCode as convertBeepBoxToMakeCode, _generatePasteJSON as generatePasteJSON };
