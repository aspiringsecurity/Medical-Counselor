import { ContractPromise } from '@polkadot/api-contract';
import { AbiMessage } from '@polkadot/api-contract/types';
import { ContractExecResult, WeightV2 } from '@polkadot/types/interfaces';
import { AnyJson, Registry, TypeDef } from '@polkadot/types/types';
import { BN, BN_ONE } from '@polkadot/util';

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE);
const PROOFSIZE = new BN(1_000_000);

// decoded output helpers
type ContractResultErr = {
  Err: AnyJson;
};

interface ContractResultOk {
  Ok: AnyJson;
}

function isErr(
  o: ContractResultErr | ContractResultOk | AnyJson
): o is ContractResultErr {
  return typeof o === 'object' && o !== null && 'Err' in o;
}

function isOk(
  o: ContractResultErr | ContractResultOk | AnyJson
): o is ContractResultOk {
  return typeof o === 'object' && o !== null && 'Ok' in o;
}

function getReturnTypeName(type: TypeDef | null | undefined) {
  return type?.lookupName || type?.type || '';
}

export function getDecodedOutput(
  { result }: Pick<ContractExecResult, 'result' | 'debugMessage'>,
  { returnType }: AbiMessage,
  registry: Registry
): {
  decodedOutput: string;
  isError: boolean;
} {
  let decodedOutput = '';
  let isError = true;
  if (result.isOk) {
    const flags = result.asOk.flags.toHuman();
    isError = flags.includes('Revert');
    const returnTypeName = getReturnTypeName(returnType);

    const r = returnType
      ? registry.createTypeUnsafe(returnTypeName, [result.asOk.data]).toHuman()
      : '()';

    // eslint-disable-next-line no-nested-ternary
    const o = isOk(r) ? r.Ok : isErr(r) ? r.Err : r;

    // eslint-disable-next-line no-nested-ternary
    const errorText = isErr(o)
      ? typeof o.Err === 'object'
        ? JSON.stringify(o.Err, null, 2)
        : o.Err?.toString() ?? 'Error'
      : o !== 'Ok'
      ? o?.toString() || 'Error'
      : 'Error';
    // eslint-disable-next-line no-nested-ternary
    const okText = isOk(r)
      ? typeof o === 'object'
        ? JSON.stringify(o, null, '\t')
        : o?.toString() ?? '()'
      : JSON.stringify(o, null, '\t') ?? '()';

    decodedOutput = isError ? errorText : okText;
  }
  return {
    decodedOutput,
    isError
  };
}

// contract call helpers
export function getGasLimit(
  registry: Registry,
  refTime: BN | number,
  proofSize: BN | number
): WeightV2 {
  return registry.createType('WeightV2', {
    refTime,
    proofSize
  });
}

export const contractQuery = async (
  contract: ContractPromise,
  registry: Registry,
  accountAddress: string,
  method: string,
  params?: any[]
) => {
  const methodArgs: (
    | string
    | {
        gasLimit: WeightV2;
        storageDepositLimit: null;
      }
    | any[]
  )[] = [
    accountAddress,
    {
      gasLimit: getGasLimit(registry, MAX_CALL_WEIGHT, PROOFSIZE),
      storageDepositLimit: null
    }
  ];
  if (params) {
    methodArgs.push(...params);
  }
  const { output, result, debugMessage, gasRequired } = await contract.query[
    method
    // @ts-ignore
  ](...methodArgs);

  const { decodedOutput } = getDecodedOutput(
    // @ts-ignore
    { result, debugMessage },
    contract.abi.findMessage(method),
    contract.abi.registry
  );
  return {
    output,
    result,
    debugMessage,
    gasRequired,
    decodedOutput: JSON.parse(decodedOutput)
  };
};

export const parseToInt = (id: string) => parseInt(id.replace(/,/g, ''), 10);
