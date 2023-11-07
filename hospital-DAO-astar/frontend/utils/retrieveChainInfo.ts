import type { ApiPromise } from '@polkadot/api';
import type { ChainType } from '@polkadot/types/interfaces';

export const retrieveChainInfo = async (api: ApiPromise) => {
  const { TypeRegistry } = await import('@polkadot/types/create');
  const registry = new TypeRegistry();

  const [systemChain, systemChainType] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.chainType
      ? api.rpc.system.chainType()
      : Promise.resolve(registry.createType('ChainType', 'Live') as ChainType)
  ]);

  return {
    systemChain: (systemChain || '<unknown>').toString(),
    systemChainType
  };
};
