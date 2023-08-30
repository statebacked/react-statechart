import {
  FlowGraph,
  GridBackground,
  schema,
} from "@statebacked/react-statechart";
import "@statebacked/react-statechart/index.css";

function App() {
  return (
    <>
      <h1>Hi</h1>
      <GridBackground>
        <FlowGraph
          editable={{
            getAvailableStates() {
              return [];
            },
            onAddTransition(sourceState) {},
            onDeleteStateItem(stateId, itemId) {},
            onDeleteTransition(sourceState, targetState, event, condition) {},
            onDeleteTransitionItem(
              sourceState,
              targetState,
              event,
              condition,
              itemId
            ) {},
            onRemoveState(stateId) {},
            onUpdateState(stateId, state) {},
            onUpdateTransition(
              sourceState,
              targetState,
              event,
              condition,
              updated
            ) {},
            onUpdateTransitionTarget(previousTargetId, newTargetId) {},
            onUpsertStateItem(stateId, item) {},
            onUpsertTransitionItem(
              sourceState,
              targetState,
              event,
              condition,
              item
            ) {},
          }}
          flow={{
            name: "my flow",
            assertions: [],
            entryActions: [],
            exitActions: [],
            id: "" as any,
            metadata: {
              actions: {},
              assertions: {},
              conditions: {},
              events: {},
            },
            requirements: [],
            states: {
              ["state1" as schema.StateId]: {
                assertions: [],
                collateral: [],
                entryActions: [],
                exitActions: [],
                name: "state1",
                transitions: [],
                type: "compound",
              },
              ["state2" as schema.StateId]: {
                assertions: [],
                collateral: [],
                entryActions: [],
                exitActions: [],
                name: "state2",
                transitions: [],
                type: "atomic",
                parent: "state1" as schema.StateId,
              },
            },
            transitions: [],
          }}
          selectedItems={[]}
        />
      </GridBackground>
    </>
  );
}

export default App;
