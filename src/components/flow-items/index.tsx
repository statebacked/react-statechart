import * as schema from "../../schema";
import styles from "./flow-icon.module.css";

import { flowItemTypePresentation } from "../../data/flows";

type FlowItemIconProps = IconProps & {
  flowItemType: schema.FlowItemType;
};

export const FlowItemIcon = ({
  flowItemType,
  transparent,
  className,
  filled,
}: FlowItemIconProps) => {
  const Component = flowItemIconComponentForType(flowItemType);
  return (
    <Component
      className={className}
      transparent={transparent}
      filled={filled}
    />
  );
};

export const flowItemIconComponentForType = (
  flowItemType: schema.FlowItemType
) => {
  switch (flowItemType) {
    case "action":
      return ActionIcon;
    case "assertion":
      return AssertionIcon;
    case "condition":
      return ConditionIcon;
    case "event":
      return EventIcon;
    case "state":
      return StateIcon;
  }
  return exhastive(flowItemType);
};

function exhastive(x: never): (p: IconProps) => JSX.Element {
  console.error("non-exhaustive match", x);
  // just make typescript happy...
  return () => <></>;
}

type IconProps = {
  className?: string;
  transparent?: boolean;
  filled?: boolean;
};

export const ActionIcon = ({ className, transparent, filled }: IconProps) => {
  return (
    <span
      title={flowItemTypePresentation.action.title}
      className={`${styles.action} ${transparent ? styles.transparent : ""} ${
        className ?? ""
      } ${filled ? styles.filled : ""}`}
    ></span>
  );
};

export const AssertionIcon = ({
  className,
  transparent,
  filled,
}: IconProps) => {
  return (
    <span
      title={flowItemTypePresentation.assertion.title}
      className={`${styles.assertion} ${
        transparent ? styles.transparent : ""
      } ${className ?? ""} ${filled ? styles.filled : ""}`}
    ></span>
  );
};

export const ConditionIcon = ({
  className,
  transparent,
  filled,
}: IconProps) => {
  return (
    <span
      title={flowItemTypePresentation.condition.title}
      className={`${styles.condition} ${
        transparent ? styles.transparent : ""
      } ${className ?? ""} ${filled ? styles.filled : ""}`}
    ></span>
  );
};

export const EventIcon = ({ className, transparent, filled }: IconProps) => {
  return (
    <span
      title={flowItemTypePresentation.event.title}
      className={`${styles.event} ${transparent ? styles.transparent : ""} ${
        className ?? ""
      } ${filled ? styles.filled : ""}`}
    ></span>
  );
};

export const StateIcon = ({ className, transparent, filled }: IconProps) => {
  return (
    <span
      title={flowItemTypePresentation.state.title}
      className={`${styles.state} ${transparent ? styles.transparent : ""} ${
        className ?? ""
      } ${filled ? styles.filled : ""}`}
    ></span>
  );
};
