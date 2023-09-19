import {
  ActionId,
  ConditionId,
  EventId,
  Flow,
  FlowId,
  State,
  StateId,
} from "../schema";

export const machineToFlow = (xstate: {
  definition: StateNodeDefinition;
}): Flow => machineDefinitionToFlow(xstate.definition);

const toStateId = (stateId: string) => stateId.replace(/[:.]/g, "_") as StateId;

export const machineDefinitionToFlow = (xstate: StateNodeDefinition): Flow => {
  const states = definitionToFlowState(undefined, xstate);
  const machineId = toStateId(xstate.id);
  const rootParts = states.find(([id]) => id === machineId);
  if (!rootParts) {
    return {
      assertions: [],
      entryActions: [],
      exitActions: [],
      id: machineId as unknown as FlowId,
      metadata: {
        actions: {},
        assertions: {},
        conditions: {},
        events: {},
      },
      name: xstate.key,
      states: {},
      transitions: [],
    };
  }

  const [id, root] = rootParts;

  const flow: Flow = {
    id: id as unknown as FlowId,
    assertions: [],
    name: root.name,
    entryActions: root.entryActions,
    exitActions: root.exitActions,
    states: Object.fromEntries(
      states
        .filter(([stateId]) => id !== stateId)
        .map(([stateId, state]) => [
          stateId,
          state.parent === id ? { ...state, parent: undefined } : state,
        ])
    ),
    transitions: root.transitions,
    initialState: root.initialState,
    metadata: {
      actions: {},
      assertions: {},
      conditions: {},
      events: {},
    },
  };

  for (const [_, state] of states) {
    const actions = state.entryActions
      .concat(state.exitActions)
      .concat(state.transitions.flatMap((transition) => transition.actions));
    for (const action of actions) {
      flow.metadata.actions[action] = {
        name: action,
      };
    }

    const conditions = state.transitions
      .map((transition) => transition.condition)
      .filter(Boolean) as Array<ConditionId>;
    for (const condition of conditions) {
      flow.metadata.conditions[condition] = {
        name: condition,
      };
    }

    const events = state.transitions
      .map((transition) => transition.event)
      .filter(Boolean) as Array<EventId>;
    for (const event of events) {
      flow.metadata.events[event] = {
        name: event,
      };
    }
  }

  return flow;
};

export const definitionToFlowState = (
  parent: StateId | undefined,
  xstate: StateNodeDefinition
): Array<[StateId, State]> => {
  const stateId = toStateId(xstate.id);
  const state: State = {
    parent,
    name: xstate.key,
    type: xstate.type,
    initialState: toStateId([xstate.id, xstate.initial].join(".")),
    transitions: xstate.transitions
      .map((t) => ({
        ...t,
        eventType:
          typeof t.delay === "number"
            ? `After ${t.delay}ms`
            : t.delay === "string"
            ? `After '${t.delay}'`
            : t.eventType.startsWith("done.invoke.")
            ? `"${t.eventType.replace(/^done[.]invoke[.]/, "")}" succeeded`
            : t.eventType.startsWith("error.platform.")
            ? `"${t.eventType.replace(/^error[.]platform[.]/, "")}" failed`
            : t.eventType,
      }))
      .map((transition) => ({
        actions: transition.actions.map((action) => action.type as ActionId),
        assertions: [],
        condition:
          transition.cond &&
          ((transition.cond.name ?? transition.cond.type) as ConditionId),
        event: (transition.eventType as EventId) || undefined,
        target: transition.target?.length ? toStateId(transition.target[0].id) : undefined,
      })),
    entryActions: xstate.entry
      .filter(
        (action) =>
          action.type !== "xstate.send" || typeof action.delay === "undefined"
      )
      .map((action) => action.type as ActionId)
      .concat(xstate.invoke.map((invoke) => invoke.id as ActionId)),
    exitActions: xstate.exit
      .filter((action) => action.type !== "xstate.cancel")
      .map((action) => action.type as ActionId),
    assertions: [],
  };

  const children = Object.values(xstate.states).flatMap(
    definitionToFlowState.bind(null, stateId)
  );

  return [[stateId, state]].concat(children) as any;
};

export type ActionObject = {
  type: string;
  delay?: number | string;
};

export type Guard = {
  name?: string;
  type: string;
};

export type TransitionDefinition = {
  target: Array<{ id: string }> | undefined;
  actions: Array<ActionObject>;
  cond?: Guard;
  eventType: string;
  delay?: number | string;
};

export type InvokeDefinition = {
  src: string | { type: string };
  id: string;
};

export type StateNodeDefinition = {
  id: string;
  key: string;
  type: "atomic" | "compound" | "parallel" | "final" | "history";
  initial: string | number | symbol | undefined;
  history: boolean | "shallow" | "deep" | undefined;
  states: Record<string, StateNodeDefinition>;
  transitions: Array<TransitionDefinition>;
  entry: Array<ActionObject>;
  exit: Array<ActionObject>;
  invoke: Array<InvokeDefinition>;
  description?: string;
  tags: string[];
};
