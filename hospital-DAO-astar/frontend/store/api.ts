import { atom } from 'jotai';
import { appConfig } from 'config';

import type { Keyring } from '@polkadot/ui-keyring';
import type { DefinitionRpc, DefinitionRpcSub } from '@polkadot/types/types';

import { ContractPromise } from '@polkadot/api-contract';

export const socketAtom = atom<string>(appConfig.providerSocket);
export const jsonrpcAtom = atom<
  Record<string, Record<string, DefinitionRpc | DefinitionRpcSub>>
>({});
export const apiAtom = atom<any | null>(null);
export const keyringAtom = atom<Keyring | null>(null);
export const apiConnectedAtom = atom<boolean>(false);
export const apiErrorAtom = atom<string | null>(null);
export const blockNumberAtom = atom<number>(0);

// contracts
export const projectContractAtom = atom<ContractPromise | null>(null);
export const employeeContractAtom = atom<ContractPromise | null>(null);
export const employeeFunctionContractAtom = atom<ContractPromise | null>(null);
export const employeeProjectContractAtom = atom<ContractPromise | null>(null);

export const projectIdsAtom = atom<number[]>([]);
