// @flow
import type { OperationType } from "@ledgerhq/live-common/types/index";
import React from "react";
import OperationStatusWrapper from "./Wrapper";
import IconReceive from "../Receive";

export default ({
  confirmed,
  failed,
  size = 24,
  type,
}: {
  confirmed?: boolean,
  failed?: boolean,
  size?: number,
  type: OperationType,
}) => (
  <OperationStatusWrapper
    size={size}
    Icon={IconReceive}
    confirmed={confirmed}
    failed={failed}
    type={type}
  />
);
