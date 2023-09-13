import { Fragment } from "react";
import {
  DrawableFlow,
  FlowItemIdentifier,
  FlowItem,
  getMetadata,
} from "../../../flow-utils";
import { SvgFlowItemIcon } from "../../svg-flow-items";
import { iconSize } from "../sizes";
import { SizedText } from "../sized-text";

export const SvgFlowItemList = ({
  flow,
  items,
  x1,
  x2,
  y1,
  y2,
}: {
  flow: DrawableFlow;
  items: Array<FlowItemIdentifier>;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}) => {
  if (items.length === 0) {
    return null;
  }

  const fullItems: Array<FlowItem> = items.map((item) => ({
    ...item,
    flowItemName: getMetadata(flow, item)?.name ?? "",
  }));

  const fullElemHeight = (y2 - y1) / fullItems.length;
  const elemHeight = fullElemHeight * 0.9;

  return (
    <>
      {fullItems.map((item, idx) => (
        <Fragment key={item.flowItemId}>
          <SvgFlowItemIcon
            flowItemType={item.flowItemType}
            x={x1}
            y={y1 + idx * fullElemHeight + 2}
            size={16}
          />
          <SizedText
            x={x1 + iconSize}
            y={y1 + (idx + 1) * fullElemHeight}
            width={x2 - x1 - iconSize}
            height={elemHeight}
          >
            {item.flowItemName}
          </SizedText>
        </Fragment>
      ))}
    </>
  );
};
