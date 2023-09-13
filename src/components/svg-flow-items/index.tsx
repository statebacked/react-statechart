import * as schema from "../../schema";

type FlowItemIconProps = IconProps & {
  flowItemType: schema.FlowItemType;
};

export const SvgFlowItemIcon = ({
  flowItemType,
  ...props
}: FlowItemIconProps) => {
  const Component = svgFlowItemIconComponentForType(flowItemType);
  return <Component {...props} />;
};

export const svgFlowItemIconComponentForType = (
  flowItemType: schema.FlowItemType
) => {
  switch (flowItemType) {
    case "action":
      return ActionIcon;
    case "entry-action":
      return EntryActionIcon;
    case "exit-action":
      return ExitActionIcon;
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

type IconProps = {
  x: number;
  y: number;
  size: number;
};

function exhastive(x: never): (props: IconProps) => JSX.Element {
  console.error("non-exhaustive match", x);
  // just make typescript happy...
  return () => <></>;
}

export const ActionIcon = ({ x, y, size }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1343_12520)">
        <path
          d="M12.5486 7.71666L8.54124 13.5053C8.1739 14.0353 7.34257 13.776 7.34257 13.1307V9.31533H3.99257C3.4619 9.31533 3.14924 8.71933 3.4519 8.28266L7.45924 2.49399C7.82657 1.96399 8.6579 2.22333 8.6579 2.86866V6.68399H12.0079C12.5379 6.68399 12.8506 7.27999 12.5486 7.71666Z"
          stroke="#00A3FF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1343_12520">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const EntryActionIcon = ({ x, y, size }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_217_22)">
        <mask
          id="mask0_217_22"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
        >
          <path d="M16 0H0V16H16V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_217_22)">
          <path
            d="M12.5486 7.71666L8.54124 13.5053C8.1739 14.0353 7.34257 13.776 7.34257 13.1307V9.31533H3.99257C3.4619 9.31533 3.14924 8.71933 3.4519 8.28266L7.45924 2.49399C7.82657 1.96399 8.6579 2.22333 8.6579 2.86866V6.68399H12.0079C12.5379 6.68399 12.8506 7.27999 12.5486 7.71666Z"
            stroke="#00A3FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M3 11L5 13"
          stroke="#00A3FF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 15.0096L4.9997 13.0099"
          stroke="#00A3FF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_217_22">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const ExitActionIcon = ({ x, y, size }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_228_66)">
        <mask
          id="mask0_228_66"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
        >
          <path d="M16 0H0V16H16V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_228_66)">
          <path
            d="M12.5486 7.71666L8.54124 13.5053C8.1739 14.0353 7.34257 13.776 7.34257 13.1307V9.31533H3.99257C3.4619 9.31533 3.14924 8.71933 3.4519 8.28266L7.45924 2.49399C7.82657 1.96399 8.6579 2.22333 8.6579 2.86866V6.68399H12.0079C12.5379 6.68399 12.8506 7.27999 12.5486 7.71666Z"
            stroke="#00A3FF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M11 1L13 3"
          stroke="#00A3FF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M11 5.00955L12.9997 3.00986"
          stroke="#00A3FF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_228_66">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const AssertionIcon = ({ x, y, size }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1343_12547)">
        <path
          d="M5.48533 7.48133L8.00333 10L13.12 4.88333C12.0667 3.15667 10.1707 2 8 2C4.686 2 2 4.686 2 8C2 11.314 4.686 14 8 14C11.088 14 13.6287 11.6667 13.9607 8.66667"
          stroke="#FE8799"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1343_12547">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const ConditionIcon = ({ x, y, size }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1343_12538)">
        <path
          d="M8.60186 13.7153C10.0958 11.8294 11.8058 10.1053 13.7008 8.57435L13.7323 8.54892C13.8163 8.48109 13.8837 8.3969 13.9299 8.30213C13.9761 8.20736 14 8.10426 14 7.99992C14 7.89558 13.9761 7.79248 13.9299 7.69771C13.8837 7.60294 13.8163 7.51875 13.7323 7.45092L13.7008 7.4255C11.8058 5.89455 10.0958 4.17047 8.60186 2.28467V2.28467C8.53187 2.1963 8.44103 2.12456 8.33656 2.07515C8.23208 2.02573 8.11684 2 8 2C7.88315 2 7.76792 2.02573 7.66344 2.07515C7.55897 2.12456 7.46813 2.1963 7.39814 2.28467V2.28467C5.90422 4.17051 4.19418 5.89462 2.29915 7.4256L2.26769 7.45103C2.18374 7.51885 2.11635 7.60305 2.07014 7.69782C2.02393 7.79259 2 7.89569 2 8.00003C2 8.10436 2.02393 8.20746 2.07014 8.30223C2.11635 8.39701 2.18374 8.4812 2.26769 8.54903L2.29915 8.57445C4.19418 10.1054 5.90422 11.8295 7.39814 13.7154V13.7154C7.46814 13.8037 7.55898 13.8755 7.66346 13.9249C7.76794 13.9743 7.88318 14 8.00003 14C8.11687 14 8.23211 13.9742 8.33658 13.9248C8.44105 13.8754 8.53188 13.8037 8.60186 13.7153V13.7153Z"
          stroke="#00C48C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1343_12538">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const EventIcon = ({ x, y, size }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1343_12529)">
        <path
          d="M5.37063 7.99998L3.18317 10.1876C2.93894 10.4318 2.93894 10.8272 3.18317 11.0709L4.92902 12.8168C5.17325 13.0611 5.56864 13.0611 5.81225 12.8168L7.99971 10.6292L9.30894 11.9385C9.63749 12.2671 10.1965 12.1347 10.3433 11.6943L12.9668 3.82281C13.1298 3.33494 12.6651 2.87018 12.1766 3.03322L4.30564 5.65684C3.86527 5.80364 3.73285 6.36272 4.06141 6.6913L5.37063 7.99998Z"
          stroke="#8753DD"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1343_12529">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const StateIcon = ({ x, y, size }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1343_12511)">
        <path
          d="M12.278 13.5H3.722C3.04667 13.5 2.5 12.9527 2.5 12.278V3.722C2.5 3.04667 3.04733 2.5 3.722 2.5H12.2773C12.9527 2.5 13.4993 3.04733 13.4993 3.722V12.2773C13.5 12.9527 12.9527 13.5 12.278 13.5V13.5Z"
          stroke="#FFCF5C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1343_12511">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
