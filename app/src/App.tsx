import {
  FlowGraph,
  GridBackground,
  xstate,
} from "@statebacked/react-statechart";
import { createMachine } from "xstate";
import "@statebacked/react-statechart/index.css";

const machine = createMachine({
  initial: "state1",
  states: {
    state1: {
      initial: "state2",
      states: {
        state2: {
          on: {
            somethingHappened: "state3",
          },
        },
        state3: {},
      },
    },
  },
});

const flow = xstate.machineToFlow(machine);

function App() {
  return (
    <>
      <h1>
        @statebacked/react-statechart - React statechart viewer and editor from{" "}
        <a href="https://app.statebacked.dev">StateBacked.dev</a>
      </h1>
      <div style={{ overflow: "hidden", width: "100%", height: "100%" }}>
        <GridBackground as="section" style={{ height: "100%" }}>
          <FlowGraph
            editable={{
              getAvailableStates() {
                return [];
              },
              onAddTransition(_sourceState) {},
              onDeleteStateItem(_stateId, _itemId) {},
              onDeleteTransition(
                _sourceState,
                _targetState,
                _event,
                _condition
              ) {},
              onDeleteTransitionItem(
                _sourceState,
                _targetState,
                _event,
                _condition,
                _itemId
              ) {},
              onRemoveState(_stateId) {},
              onUpdateState(_stateId, _state) {},
              onUpdateTransition(
                _sourceState,
                _targetState,
                _event,
                _condition,
                _updated
              ) {},
              onUpdateTransitionTarget(_previousTargetId, _newTargetId) {},
              onUpsertStateItem(_stateId, _item) {},
              onUpsertTransitionItem(
                _sourceState,
                _targetState,
                _event,
                _condition,
                _item
              ) {},
            }}
            flow={flow}
          />
        </GridBackground>
      </div>
    </>
  );
}

export default App;
