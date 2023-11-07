import { atom } from 'jotai';
import type { KeyringPair } from '@polkadot/keyring/types';
import { keyringAtom } from './api';

export const SUBSTRATE_ACCOUNT_STORAGE_KEY = 'substrateAccountStorageKey';

// Substrate
export const substrateAccountAddressAtom = atom<string | null>(
  typeof window !== 'undefined'
    ? localStorage.getItem(SUBSTRATE_ACCOUNT_STORAGE_KEY)
    : null
);
export const substrateAccountAtom = atom<KeyringPair | null>(null);
export const setCurrentSubstrateAccountAtom = atom(
  null,
  (_get, _set, _account: KeyringPair) => {
    _set(substrateAccountAtom, _account);
    _set(substrateAccountAddressAtom, _account?.address.toString());

    localStorage.setItem(SUBSTRATE_ACCOUNT_STORAGE_KEY, _account.address);
  }
);

export const currentSubstrateAccountAtom = atom((_get) =>
  _get(substrateAccountAtom)
);

export const disconnectSubstrateAccountAtom = atom(null, (_get, _set) => {
  localStorage.removeItem(SUBSTRATE_ACCOUNT_STORAGE_KEY);
  _set(substrateAccountAtom, null);
  _set(substrateAccountAddressAtom, null);
});

export const accountsAtom = atom((_get) => _get(keyringAtom)?.getPairs());
