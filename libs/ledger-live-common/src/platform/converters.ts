import BigNumber from "bignumber.js";
import byFamily from "../generated/platformAdapter";

import type {
  Account,
  AccountLike,
  ChildAccount,
  CryptoCurrency,
  TokenAccount,
  Transaction,
} from "../types";
import type {
  PlatformAccount,
  PlatformCurrency,
  PlatformTransaction,
} from "./types";

export function accountToPlatformAccount(
  account: AccountLike
): PlatformAccount {
  switch (account.type) {
    case "TokenAccount":
      return tokenAccountToPlatformAccount(account);
    case "ChildAccount":
      return childAccountToPlatformAccount(account);
    default:
      return toPlatformAccount(account);
  }
}
function toPlatformAccount(account: Account): PlatformAccount {
  return {
    id: account.id,
    name: account.name,
    address: account.freshAddress,
    currency: account.currency.id,
    balance: account.balance,
    spendableBalance: account.spendableBalance,
    blockHeight: account.blockHeight,
    lastSyncDate: account.lastSyncDate,
  };
}
function tokenAccountToPlatformAccount(account: TokenAccount): PlatformAccount {
  return {
    id: account.id,
    name: "",
    address: "",
    currency: "",
    balance: account.balance,
    spendableBalance: account.spendableBalance,
    blockHeight: 0,
    lastSyncDate: new Date(),
  };
}
function childAccountToPlatformAccount(account: ChildAccount): PlatformAccount {
  return {
    id: account.id,
    name: account.name,
    address: "",
    currency: account.currency.id,
    balance: account.balance,
    spendableBalance: new BigNumber(0),
    blockHeight: 0,
    lastSyncDate: new Date(),
  };
}

export function currencyToPlatformCurrency(
  currency: CryptoCurrency
): PlatformCurrency {
  return {
    type: currency.type,
    id: currency.id,
    ticker: currency.ticker,
    name: currency.name,
    family: currency.family,
    color: currency.color,
    units: currency.units.map((unit) => ({
      name: unit.name,
      code: unit.code,
      magnitude: unit.magnitude,
    })),
  };
}

export const getPlatformTransactionSignFlowInfos = (
  platformTx: PlatformTransaction
): {
  canEditFees: boolean;
  hasFeesProvided: boolean;
  liveTx: Partial<Transaction>;
} => {
  const family = byFamily[platformTx.family];

  if (family) {
    return family.getPlatformTransactionSignFlowInfos(platformTx);
  }

  return {
    canEditFees: false,
    liveTx: { ...platformTx } as Partial<Transaction>,
    hasFeesProvided: false,
  };
};
