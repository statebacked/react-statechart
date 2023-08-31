import * as schema from "../schema";
import { ElkExtendedEdge, ElkNode } from "elkjs";
import { DrawableFlow } from "../flow-utils";

type EnrichedElkEdge = ElkExtendedEdge & {
  data: {
    transitionId: PositionedItemId;
    source: schema.StateId;
    target: schema.StateId;
    container?: schema.StateId;
  };
};
export type EnrichedElkNode = ElkNode & {
  syntheticEdgeNodes: EnrichedElkNode[];
  edges?: EnrichedElkEdge[];
  children?: EnrichedElkNode[];
};

const rootNodeLayoutOptions = (direction: "horizontal" | "vertical") => ({
  "elk.hierarchyHandling": "INCLUDE_CHILDREN",
  "elk.algorithm": "layered",
  "elk.layered.considerModelOrder": "NODES_AND_EDGES",
  "elk.layered.wrapping.strategy": "MULTI_EDGE",
  "elk.aspectRatio": direction === "vertical" ? "0.5" : "2",
  "elk.direction": direction === "vertical" ? "DOWN" : "RIGHT",
  "elk.layered.spacing.baseValue": "25",
  //"elk.layered.compaction.postCompaction.strategy": "TOP", // TODO: this may fail
});

const nodeLayoutOptions = (direction: "horizontal" | "vertical") => ({
  "elk​.alignment": "CENTER",
  "elk.aspectRatio": direction === "vertical" ? "0.5" : "2",
  "elk.direction": direction === "vertical" ? "DOWN" : "RIGHT",
  "elk.layered.edgeRouting.selfLoopOrdering": "SEQUENCED",
  "elk.layered.edgeRouting.selfLoopDistribution": "EQUALLY",
  "elk.layered.spacing.baseValue": "25",
  //"elk.layered.compaction.postCompaction.strategy": "TOP", // TODO: this may fail
});

export type PositionedItemId = string & { _BRAND: "positionedItem" };

export const getStatePositionId = (stateId: schema.StateId) =>
  `state:${stateId}` as PositionedItemId;

export const getTransitionPositionId = (
  sourceStateId: schema.StateId,
  transitionIdx: number,
  targetStateId: schema.StateId | undefined
) =>
  `transition:${sourceStateId}:${transitionIdx}:${
    targetStateId ?? sourceStateId
  }` as PositionedItemId;

export type Connector = {
  targetIsEvent: boolean;
  sourceIsEvent: boolean;
  container: schema.StateId;
  transitionId: PositionedItemId;
  points: Array<{ x: number; y: number }>;
};

export type PositionInfo = {
  x: number;
  y: number;
  width: number;
  height: number;
  connector?: Connector;
  padding?: Size["padding"];
};

export const toLayoutMap = (
  sizeMap: Map<PositionedItemId, Size>,
  elk: EnrichedElkNode
): Map<PositionedItemId, PositionInfo> => {
  const positionId = elk.id as PositionedItemId;

  const map = new Map(
    (elk.edges ?? [])
      .flatMap((edge: EnrichedElkEdge) =>
        (edge.labels ?? []).map((label): [PositionedItemId, PositionInfo] => [
          edge.id as PositionedItemId,
          {
            x: label.x!,
            y: label.y!,
            width: label.width!,
            height: label.height!,
            connector: {
              transitionId: edge.data.transitionId,
              container: edge.data.container!,
              targetIsEvent: edge.targets.some((t) => t.startsWith("synth:")),
              sourceIsEvent: edge.sources.some((t) => t.startsWith("synth:")),
              points: edge.sections
                ? edge.sections.flatMap((section) => [
                    section.startPoint,
                    ...(section.bendPoints ?? []),
                    section.endPoint,
                  ])
                : [],
            },
          },
        ])
      )
      .concat([
        [
          positionId,
          {
            x: elk.x!,
            y: elk.y!,
            width: elk.width!,
            height: elk.height!,
            padding: sizeMap.get(positionId)?.padding,
          },
        ],
      ])
  );

  for (const child of elk.children ?? []) {
    const childMap = toLayoutMap(sizeMap, child);
    for (const [k, v] of childMap) {
      map.set(k, v);
    }
  }

  return map;
};

type EdgeIdsByTarget = Map<schema.StateId, Array<PositionedItemId>>;

const getEdgeIdsByTarget = (
  states: DrawableFlow["states"]
): EdgeIdsByTarget => {
  const map = new Map<schema.StateId, Set<PositionedItemId>>();
  for (const [stateId, state] of Object.entries(states)) {
    const len = state?.transitions.length ?? 0;
    for (let i = 0; i < len; ++i) {
      const transition = state!.transitions[i];
      const target = transition.target ?? (stateId as schema.StateId);

      const posId = getTransitionPositionId(
        stateId as schema.StateId,
        i,
        target
      );
      const cur = map.get(target) ?? new Set();
      cur.add(posId);
      map.set(target, cur);
    }
  }

  return new Map(
    Array.from(map.entries()).map(([stateId, items]) => [
      stateId,
      Array.from(items),
    ])
  );
};

export type DrawableFlowWithTopLevelState = DrawableFlow & {
  _BRAND: "with-top-level-states";
};

export type Size = {
  width: number;
  height: number;
  padding?: { top: number; bottom: number; left: number; right: number };
};

export function flowToElkGraph(
  sizeMap: Map<PositionedItemId, Size>,
  rootId: schema.StateId,
  flow: DrawableFlowWithTopLevelState,
  direction: "horizontal" | "vertical"
): EnrichedElkNode {
  const edgeIdsByTarget = getEdgeIdsByTarget(flow.states);
  const node = _flowToElkGraph(
    sizeMap,
    rootId,
    edgeIdsByTarget,
    flow.states,
    rootId,
    rootNodeLayoutOptions(direction),
    nodeLayoutOptions(direction)
  )[0];
  return node;
}

export const getFullFlow = (
  rootId: schema.StateId,
  flowStateId: schema.StateId,
  flow: DrawableFlow
): DrawableFlowWithTopLevelState => {
  const statesWithParent = Object.entries(flow.states).reduce(
    (byId, [stateId, state]) => ({
      ...byId,
      [stateId]: state?.parent ? state : { ...state, parent: flowStateId },
    }),
    {}
  );
  const effectiveStates = {
    ...statesWithParent,
    [flowStateId]: createRootFlowState(rootId, flow),
  };

  return {
    _BRAND: "with-top-level-states",
    assertions: [],
    entryActions: [],
    exitActions: [],
    id: rootId as any,
    metadata: flow.metadata,
    states: effectiveStates,
    transitions: [],
    initialState: flowStateId,
  };
};

const createRootFlowState = (
  rootId: schema.StateId,
  flow: DrawableFlow
): DrawableFlow["states"][any] => ({
  parent: rootId,
  assertions: flow.assertions,
  entryActions: flow.entryActions,
  exitActions: flow.exitActions,
  name: flow.name ?? "Flow",
  transitions: flow.transitions,
  type: "compound",
  initialState: flow.initialState,
});

export function _flowToElkGraph(
  sizeMap: Map<PositionedItemId, Size>,
  rootId: schema.StateId,
  edgeIdsByTarget: EdgeIdsByTarget,
  states: DrawableFlow["states"],
  stateId: schema.StateId,
  rootNodeLayoutOptions: Record<string, string>,
  nodeLayoutOptions: Record<string, string>
): [EnrichedElkNode, Set<string>] {
  const childNodes = Object.entries(states)
    .filter(([_stateId, state]) => state!.parent === stateId)
    .map(([stateId, state]) => stateId as schema.StateId);

  const isLeaf = childNodes.length == 0;
  const state = states[stateId];

  const parentPositionId = getStatePositionId(stateId);

  const allOwnEdges = state
    ? edgesFromState(sizeMap, stateId, state, states)
    : [];

  const layoutOpts =
    stateId === rootId ? rootNodeLayoutOptions : nodeLayoutOptions;

  const [ourEdges, syntheticEdges] = partition(
    allOwnEdges,
    (edge) => !edge.sources[0].startsWith("synth:")
  );

  const syntheticEdgeNodes = ourEdges
    .filter((edge) => edge.targets[0].startsWith("synth:"))
    .map((edge) => {
      const transitionId = edge.data.transitionId;
      const pos = sizeMap.get(transitionId);

      return {
        id: transitionId,
        height: pos?.height,
        width: pos?.width,
        layoutOptions: layoutOpts,
        sourceState: edge.data.source,
        syntheticEdgeNodes: [],
        ports: [
          {
            id: `synth:target:${transitionId}`,
          },
          {
            id: `synth:source:${transitionId}`,
          },
        ],
      };
    });

  const sourcePorts = ourEdges.map((edge) => ({
    edge,
    id: edge.sources[0],
    layoutOptions: {},
  }));

  const targetPorts = (edgeIdsByTarget.get(stateId) ?? []).map((edgeId) => ({
    id: `port:${edgeId}`,
    layoutOptions: {},
  }));

  if (isLeaf) {
    return [
      {
        ...sizeMap.get(parentPositionId),
        id: parentPositionId,
        edges: edgesWithContainer(stateId, allOwnEdges),
        syntheticEdgeNodes,
        labels: [{ text: states[stateId]!.name }],
        layoutOptions: layoutOpts,
        ports: targetPorts.concat(sourcePorts),
      },
      new Set(),
    ];
  }

  let descendants = new Set<string>([stateId]);
  let edges = allOwnEdges;

  const initialChildState = state?.initialState;
  const initialChildStatePositionId = initialChildState
    ? getStatePositionId(initialChildState)
    : null;

  const children = childNodes
    .flatMap((stateId) => {
      const [subGraph, nodes] = _flowToElkGraph(
        sizeMap,
        rootId,
        edgeIdsByTarget,
        states,
        stateId,
        rootNodeLayoutOptions,
        nodeLayoutOptions
      );

      descendants = union(descendants, nodes);
      descendants.add(stateId);

      // Edges need to be on the lowest common ancestor for a node
      const [localEdges, otherEdges] = partition(
        subGraph.edges || [],
        (e: EnrichedElkEdge) => {
          const isCurrentNodeSelfEdge =
            e.data.source === e.data.target && e.data.source === stateId;
          return (
            nodes.has(e.data.source) &&
            nodes.has(e.data.target) &&
            !isCurrentNodeSelfEdge
          );
        }
      );

      edges = edges.concat(otherEdges);

      return subGraph.syntheticEdgeNodes.concat([
        { ...subGraph, edges: localEdges },
      ]);
    })
    .sort((a, b) =>
      a.id === initialChildStatePositionId
        ? -1
        : b.id === initialChildStatePositionId
        ? 1
        : 0
    );

  const size = sizeMap.get(parentPositionId);

  const [ourSyntheticChildren, parentSyntheticChildren] = partition(
    syntheticEdgeNodes,
    (node) => node.sourceState === stateId
  );

  return [
    {
      id: parentPositionId,
      children: children.concat(ourSyntheticChildren),
      edges: edgesWithContainer(stateId, edges),
      syntheticEdgeNodes: parentSyntheticChildren,
      ...size,
      ports: targetPorts.concat(
        sourcePorts.map((port) => {
          const isInteriorPort =
            descendants.has(port.edge.data.target) &&
            port.edge.data.target !== stateId;
          const topPadding = size?.padding?.top;
          // a bit weird but we have some padding applied to every side and additional padding on the top
          // we need to make sure our port sits above the normal amount of padding but below the top padding
          const extraPadding = size?.padding?.left ?? 0;
          return isInteriorPort && topPadding
            ? {
                ...port,
                layoutOptions: {
                  "elk.port.borderOffset": `${-topPadding + extraPadding}`,
                },
              }
            : port;
        })
      ),
      layoutOptions: {
        ...layoutOpts,
        ...(size?.padding
          ? {
              "elk.padding": `[top=${size.padding.top}, bottom=${size.padding.bottom}, left=${size.padding.left}, right=${size.padding.right}]`,
            }
          : {}),
      },
    },
    descendants,
  ];
}

const edgesWithContainer = (
  container: schema.StateId,
  edges: Array<EnrichedElkEdge>
): Array<EnrichedElkEdge> =>
  edges.map((edge) => ({
    ...edge,
    data: { ...edge.data, container },
  }));

// Extract a sequence of edges from a SimplyStated state
export function edgesFromState(
  sizeMap: Map<PositionedItemId, { width: number; height: number }>,
  stateId: schema.StateId,
  state: NonNullable<DrawableFlow["states"][any]>,
  states: NonNullable<DrawableFlow["states"]>
): EnrichedElkEdge[] {
  const parent = state.parent ? states[state.parent] : null;
  const isFromInitialEdge = parent?.initialState === stateId;

  return state.transitions.flatMap((transition, idx): EnrichedElkEdge[] => {
    const target = transition.target ?? (stateId as schema.StateId);
    const transitionId = getTransitionPositionId(stateId, idx, target);

    const isSelfEdge = stateId === target;

    if (isSelfEdge) {
      // we don't make synthetic nodes for self edges
      return [
        {
          id: transitionId,
          data: {
            transitionId,
            source: stateId,
            target,
          },
          sources: [`port:source:${transitionId}`],
          targets: [`port:${transitionId}`],
          labels: [
            {
              text: transition.event || "Always",
              ...sizeMap.get(transitionId),
              layoutOptions: {
                "elk.edgeLabels.inline": isSelfEdge ? "false" : "true", // inline if it is not a self-edge
                "elk.edgeLabels.placement": "CENTER",
                "elk.edgeLabels.centerLabelPlacementStrategy": "TAIL_LAYER",
              },
            },
          ],
          layoutOptions: {
            // give priority to initial edges
            "elk.layered.priority.direction": isFromInitialEdge ? "1" : "0",
          },
        },
      ];
    }

    const inEdge = {
      id: `edge:in:${transitionId}`,
      data: {
        transitionId,
        source: stateId,
        target,
      },
      sources: [`port:source:${transitionId}`],
      targets: [`synth:target:${transitionId}`],
      labels: [
        {
          text: " ",
          width: 0,
          height: 0,
          layoutOptions: {},
        },
      ],
      layoutOptions: {
        // give priority to initial edges
        "elk.layered.priority.direction": isFromInitialEdge ? "1" : "0",
      },
    };

    const outEdge = {
      id: `edge:out:${transitionId}`,
      data: {
        transitionId,
        source: stateId,
        target,
      },
      sources: [`synth:source:${transitionId}`],
      targets: [`port:${transitionId}`],
      labels: [
        {
          text: " ",
          width: 0,
          height: 0,
          layoutOptions: {},
        },
      ],
      layoutOptions: {
        // give priority to initial edges
        "elk.layered.priority.direction": isFromInitialEdge ? "1" : "0",
      },
    };

    return [inEdge, outEdge];
  });
}

type PartialGraph = {
  nodes: string[];
  edges: EnrichedElkEdge[];
};

const mergeGraphs = (acc: PartialGraph, curr: PartialGraph) => ({
  nodes: acc.nodes.concat(curr.nodes),
  edges: acc.edges.concat(curr.edges),
});

export const union = <U>(x: Set<U>, y: Set<U>): Set<U> => new Set([...x, ...y]);

export const partition = <U>(
  input: U[],
  predicate: (arg0: U) => boolean
): [U[], U[]] => {
  const left = Array<U>();
  const right = Array<U>();

  for (const i of input) {
    if (predicate(i)) {
      left.push(i);
    } else {
      right.push(i);
    }
  }

  return [left, right];
};
