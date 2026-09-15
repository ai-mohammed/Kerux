/**
 * Replays every scenario of the executable spec (unspa/) against the real site
 * code through tests/unspa-adapter.ts. If the checkout rules drift from the
 * spec — or the spec from the rules — this suite fails.
 *
 *   node scripts/unspa-spec.mjs      # regenerate the spec
 *   npm run spec:check               # simulator + model checker on the spec alone
 *   npm test                         # the spec replayed against the code (this file)
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { KeruxAdapter, type Params, type Status } from "./unspa-adapter";

type Leaf = { path: string; operator: string; value?: unknown };
type Step = { actionId: string; surfaceId?: string; parameterOverrides: { parameterName: string; value: unknown }[]; expectedStatus?: Status };
type Scenario = {
  id: string;
  name: string;
  stateOverrides: { path: string; value: unknown }[];
  parameterOverrides: { parameterName: string; value: unknown }[];
  expectedStatus?: Status;
  expectedAssertions?: Leaf[];
  steps?: Step[];
};
type Action = { id: string; name: string; parameters: { name: string; defaultValue?: unknown }[]; scenarios?: Scenario[] };
type Surface = { id: string; name: string; actions: Action[] };
type Feature = { name: string; surfaces: Surface[] };

const { feature } = JSON.parse(readFileSync(new URL("../unspa/kerux-foods/commande-kerux.feature.json", import.meta.url), "utf8")) as { feature: Feature };
const actionsById = new Map(feature.surfaces.flatMap((s) => s.actions.map((a) => [a.id, a] as const)));

const readPath = (root: unknown, path: string): unknown => path.split(".").reduce<unknown>((cur, seg) => (cur && typeof cur === "object" ? (cur as Record<string, unknown>)[seg] : undefined), root);

const holds = (left: unknown, operator: string, right: unknown): boolean => {
  switch (operator) {
    case "equals": return left === right;
    case "not_equals": return left !== right;
    case "greater_than": return typeof left === "number" && typeof right === "number" && left > right;
    case "greater_or_equal": return typeof left === "number" && typeof right === "number" && left >= right;
    case "lower_than": return typeof left === "number" && typeof right === "number" && left < right;
    case "lower_or_equal": return typeof left === "number" && typeof right === "number" && left <= right;
    case "is_true": return left === true;
    case "is_false": return left === false;
    case "exists": return left !== undefined && left !== null;
    case "does_not_exist": return left === undefined || left === null;
    default: throw new Error(`Opérateur non géré : ${operator}`);
  }
};

const paramsFor = (action: Action, overrides: { parameterName: string; value: unknown }[]): Params => {
  const p: Params = {};
  for (const def of action.parameters) if (def.defaultValue !== undefined) p[def.name] = def.defaultValue;
  for (const o of overrides) p[o.parameterName] = o.value;
  return p;
};

describe(`Spec exécutable — ${feature.name}`, () => {
  for (const surface of feature.surfaces) {
    describe(surface.name, () => {
      for (const action of surface.actions) {
        for (const scenario of action.scenarios ?? []) {
          it(`${action.name} › ${scenario.name}`, () => {
            const adapter = new KeruxAdapter();
            adapter.reset();
            for (const o of scenario.stateOverrides) adapter.override(o.path, o.value);

            for (const [i, step] of (scenario.steps ?? []).entries()) {
              const stepAction = actionsById.get(step.actionId);
              if (!stepAction) throw new Error(`step ${i}: action ${step.actionId} inconnue`);
              const status = adapter.invoke(stepAction.name, paramsFor(stepAction, step.parameterOverrides));
              expect(status, `étape ${i + 1} (${stepAction.name})`).toBe(step.expectedStatus ?? "success");
            }

            const status = adapter.invoke(action.name, paramsFor(action, scenario.parameterOverrides));
            expect(status, "statut de l'action").toBe(scenario.expectedStatus ?? "success");

            const snapshot = adapter.snapshot();
            for (const a of scenario.expectedAssertions ?? []) {
              const actual = readPath(snapshot, a.path);
              expect(holds(actual, a.operator, a.value), `${a.path} ${a.operator} ${JSON.stringify(a.value)} (actuel : ${JSON.stringify(actual)})`).toBe(true);
            }
          });
        }
      }
    });
  }
});
