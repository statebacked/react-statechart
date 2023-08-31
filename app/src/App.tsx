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
            EVENT: "state3",
          },
          onDone: "state3",
        },
        state3: {},
      },
    },
  },
});

const flow = xstate.xstateMachineToFlow(machine);

function App() {
  return (
    <>
      <h1>Hi</h1>
      <div style={{ overflow: "hidden", width: "100%", height: 500 }}>
        <GridBackground as="section">
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
            selectedItems={[]}
          />
        </GridBackground>
      </div>
    </>
  );
}

export default App;
