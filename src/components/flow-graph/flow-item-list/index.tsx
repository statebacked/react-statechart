import {
  DrawableFlow,
  FlowItemIdentifier,
  getMetadata,
} from "../../../flow-utils";
import { FlowItemIcon } from "../../flow-items";
import styles from "./flow-item-list.module.css";
import { FlowItem } from "../../../transformers/types";
import { RiAddCircleLine, RiDeleteBinLine } from "react-icons/ri";
import { IconButton } from "../../icon-button";
import { useModal } from "../../../hooks/use-modal";
import { Popup, PopupWrapper } from "../../popup";
import { flowItemTypePresentation, freshFlowItemId } from "../../../data/flows";
import { models } from "../../../schema";
import { EditableOnClick } from "../../editable-on-click";

const newItemId = "";

export const FlowItemList = ({
  flow,
  items,
  nonEmptyClassName,
  editable,
}: {
  flow: DrawableFlow;
  items: Array<FlowItemIdentifier>;
  nonEmptyClassName?: string;
  editable?: {
    eligibleTypes: Array<models.FlowItemType>;
    typeLabelOverride?: Partial<Record<models.FlowItemType, string>>;
    onUpsertItem: (item: FlowItem) => void;
    onDeleteItem: (itemId: FlowItemIdentifier) => void;
  };
}) => {
  const newItems = items.filter((item) => item.flowItemId === newItemId);
  const realItems = items.filter((item) => item.flowItemId !== newItemId);
  const fullItems: Array<FlowItem> = realItems.concat(newItems).map((item) => ({
    ...item,
    flowItemName: getMetadata(flow, item)?.name ?? "",
  }));

  return (
    <ul
      className={`${styles.flowItemList} ${
        fullItems.length ? nonEmptyClassName : ""
      }`}
    >
      {fullItems.map((item) => (
        <li key={item.flowItemId} className={styles.flowItemListItem}>
          <div className={styles.iconContainer}>
            {editable ? (
              <div>
                <IconButton
                  icon={<RiDeleteBinLine size={16} />}
                  title="Delete"
                  size={16}
                  onClick={() => editable.onDeleteItem(item)}
                />
              </div>
            ) : null}
            <FlowItemIcon
              transparent
              flowItemType={item.flowItemType}
              className={styles.flowItemIcon}
            />
          </div>{" "}
          {editable ? (
            <EditableOnClick
              className={styles.editableName}
              initiallyEditable={item.flowItemId === newItemId}
              text={item.flowItemName}
              onEmptied={() => editable.onDeleteItem(item)}
              onChange={(name) => {
                if (!name) {
                  editable.onDeleteItem(item);
                  return;
                }

                const flowItemId =
                  item.flowItemId === newItemId
                    ? freshFlowItemId()
                    : item.flowItemId;

                editable.onUpsertItem({
                  flowItemId: flowItemId as any,
                  flowItemName: name,
                  flowItemType: item.flowItemType,
                });
                if (flowItemId !== item.flowItemId) {
                  editable.onDeleteItem(item);
                }
              }}
            />
          ) : (
            <span className={styles.editableName}>{item.flowItemName}</span>
          )}
        </li>
      ))}
      {editable ? (
        <AddListItem
          eligibleTypes={editable.eligibleTypes}
          typeLabelOverride={editable.typeLabelOverride ?? {}}
          onAddItem={(type) => {
            editable.onUpsertItem({
              flowItemId: newItemId,
              flowItemType: type,
              flowItemName: "",
            } as FlowItem);
          }}
        />
      ) : null}
    </ul>
  );
};

const AddListItem = ({
  onAddItem,
  eligibleTypes,
  typeLabelOverride,
}: {
  onAddItem: (type: models.FlowItemType) => void;
  eligibleTypes: Array<models.FlowItemType>;
  typeLabelOverride: Partial<Record<models.FlowItemType, string>>;
}) => {
  const { open, onOpen, onClose } = useModal();

  return (
    <li className={styles.flowItemListItem}>
      <PopupWrapper>
        <IconButton
          icon={<RiAddCircleLine size={16} />}
          size={16}
          title="Add"
          onClick={onOpen}
        />
        <Popup isOpen={open} onClose={onClose} className={styles.addItemPopup}>
          <div className={styles.addItemMenu}>
            {eligibleTypes?.map((type) => (
              <div
                key={type}
                className={styles.addItemMenuItem}
                onClick={() => {
                  onAddItem(type);
                  onClose();
                }}
              >
                <FlowItemIcon transparent flowItemType={type} />{" "}
                {typeLabelOverride[type] ??
                  `Add ${flowItemTypePresentation[type].title}`}
              </div>
            ))}
          </div>
        </Popup>
      </PopupWrapper>
    </li>
  );
};
