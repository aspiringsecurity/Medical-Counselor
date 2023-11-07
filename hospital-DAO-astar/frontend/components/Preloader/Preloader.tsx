import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  apiAtom,
  apiConnectedAtom,
  apiErrorAtom,
  jsonrpcAtom,
  keyringAtom,
  socketAtom
} from 'store/api';
import {
  setCurrentSubstrateAccountAtom,
  disconnectSubstrateAccountAtom,
  currentSubstrateAccountAtom,
  substrateAccountAddressAtom,
  SUBSTRATE_ACCOUNT_STORAGE_KEY
} from 'store/substrateAccount';
import { appConfig } from 'config';
import { retrieveChainInfo } from 'utils/retrieveChainInfo';
import type { ApiPromise } from '@polkadot/api';
import type { Keyring } from '@polkadot/ui-keyring';

export function Preloader() {
  const connectRef = useRef<boolean>(false);
  const [api, setApi] = useAtom(apiAtom);
  const [keyring, setKeyring] = useAtom(keyringAtom);

  const socket = useAtomValue(socketAtom);
  const setApiError = useSetAtom(apiErrorAtom);
  const setJsonRPC = useSetAtom(jsonrpcAtom);
  const setApiConnected = useSetAtom(apiConnectedAtom);
  const substrateAccountAddress = useAtomValue(substrateAccountAddressAtom);
  const setCurrentSubstrateAccount = useSetAtom(setCurrentSubstrateAccountAtom);
  const currentSubstrateAccount = useAtomValue(currentSubstrateAccountAtom);
  const disconnectSubstrateAccount = useSetAtom(disconnectSubstrateAccountAtom);

  const loadCurrentAccount = useCallback(
    async (_keyring: Keyring, _substrateAccountAddress: string | null) => {
      try {
        if (_substrateAccountAddress) {
          setCurrentSubstrateAccount(
            _keyring.getPair(_substrateAccountAddress)
          );
        } else {
          const storedAccount = localStorage.getItem(
            SUBSTRATE_ACCOUNT_STORAGE_KEY
          );

          if (storedAccount) {
            setCurrentSubstrateAccount(_keyring.getPair(storedAccount));
          }
        }
      } catch (e) {
        disconnectSubstrateAccount();
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },

    [disconnectSubstrateAccount, setCurrentSubstrateAccount]
  );

  const loadAccounts = useCallback(
    async (_api: ApiPromise) => {
      const { isTestChain } = await import('@polkadot/util');
      const { keyring: uikeyring } = await import('@polkadot/ui-keyring');

      try {
        const { systemChain, systemChainType } = await retrieveChainInfo(_api);
        const isDevelopment =
          systemChainType.isDevelopment ||
          systemChainType.isLocal ||
          isTestChain(systemChain);

        uikeyring.loadAll({ isDevelopment });

        setKeyring(uikeyring);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
    [setKeyring]
  );

  const connect = useCallback(async () => {
    const jsonrpc = (await import('@polkadot/types/interfaces/jsonrpc'))
      .default;
    const { ApiPromise, WsProvider } = await import('@polkadot/api');

    const rpc = { ...jsonrpc, ...appConfig.customRPCMethods };
    setJsonRPC(rpc);

    const provider = new WsProvider(socket);
    const _api = new ApiPromise({ provider, rpc });

    _api.on('connected', () => setApiConnected(true));
    _api.on('disconnected', () => setApiConnected(false));
    _api.on('error', (err: Error) => setApiError(err.message));
    _api.on('ready', () => setApi(_api));
  }, [setApi, setApiConnected, setApiError, setJsonRPC, socket]);

  useEffect(() => {
    if (!keyring || currentSubstrateAccount) {
      return;
    }

    loadCurrentAccount(keyring, substrateAccountAddress);
  }, [
    keyring,
    substrateAccountAddress,
    loadCurrentAccount,
    currentSubstrateAccount
  ]);

  useEffect(() => {
    if (!api || keyring) {
      return;
    }

    loadAccounts(api);
  }, [api, keyring, loadAccounts]);

  useEffect(() => {
    if (connectRef.current) {
      return;
    }

    connect();
    connectRef.current = true;
  }, [connect]);

  return null;
}
