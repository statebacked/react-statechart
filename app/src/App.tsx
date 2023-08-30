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
                  type: "parallel",
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
      </div>
    </>
  );
}

export default App;
