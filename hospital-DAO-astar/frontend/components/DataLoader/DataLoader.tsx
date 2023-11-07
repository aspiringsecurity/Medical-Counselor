import { ContractPromise } from '@polkadot/api-contract';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  apiAtom,
  blockNumberAtom,
  employeeContractAtom,
  employeeFunctionContractAtom,
  employeeProjectContractAtom,
  projectContractAtom,
  projectIdsAtom
} from 'store/api';
import ProjectAbi from 'abis/project.json';
import EmployeeAbi from 'abis/employee.json';
import AssignmentAbi from 'abis/assignment.json';
import { appConfig } from 'config';
import { substrateAccountAddressAtom } from 'store/substrateAccount';
import { contractQuery, parseToInt } from 'helpers';

export function DataLoader() {
  const api = useAtomValue(apiAtom);
  const setProjectIds = useSetAtom(projectIdsAtom);
  const [blockNumber, setBlockNumber] = useAtom(blockNumberAtom);
  const [projectContract, setProjectContract] = useAtom(projectContractAtom);
  const [employeeContract, setEmployeeContract] = useAtom(employeeContractAtom);
  const [employeeFunctionContract, setEmployeeFunctionContract] = useAtom(
    employeeFunctionContractAtom
  );
  const [employeeProjectContract, setEmployeeProjectContract] = useAtom(
    employeeProjectContractAtom
  );
  const currentAccountAddress = useAtomValue(substrateAccountAddressAtom);

  const getProjects = useCallback(async () => {
    if (!projectContract?.query || !currentAccountAddress) return;
    // fetch projects from smart contract on substrate chain
    const { decodedOutput, result } = await contractQuery(
      projectContract,
      api.registry,
      currentAccountAddress,
      'listProjectIds'
    );

    if (result.isOk) {
      const projectIds = decodedOutput.Ok.map(parseToInt);
      console.log('projectIds', projectIds);
      setProjectIds(projectIds);
    } else {
      throw new Error('Error fetching projects');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectContract?.query]);
  console.log(blockNumber);

  useEffect((): undefined | (() => void) => {
    if (!api?.derive.chain) return;
    let unsubscribeAll: (() => any) | null = null;

    api.derive.chain
      .bestNumber((number: any) => setBlockNumber(number.toNumber()))
      .then((unsub: any) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    // eslint-disable-next-line consistent-return
    return () => unsubscribeAll && unsubscribeAll();
  }, [api?.derive.chain]);

  useEffect(() => {
    if (!api || !blockNumber) return;
    getProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  useEffect(() => {
    if (!api) return;
    if (!projectContract) {
      const _p = new ContractPromise(
        api,
        ProjectAbi,
        appConfig.projectContractAddress
      );
      console.log(_p.query);
      setProjectContract(_p);
    }

    if (!employeeContract) {
      setEmployeeContract(
        new ContractPromise(api, EmployeeAbi, appConfig.employeeContractAddress)
      );
    }

    if (!employeeFunctionContract) {
      setEmployeeFunctionContract(
        new ContractPromise(
          api,
          AssignmentAbi,
          appConfig.employeeFunctionContractAddress
        )
      );
    }

    if (!employeeProjectContract) {
      setEmployeeProjectContract(
        new ContractPromise(
          api,
          AssignmentAbi,
          appConfig.employeeProjectContractAddress
        )
      );
    }
  }, [
    api,
    projectContract,
    employeeContract,
    setProjectContract,
    setEmployeeContract,
    employeeFunctionContract,
    setEmployeeFunctionContract,
    employeeProjectContract,
    setEmployeeProjectContract
  ]);

  return null;
}
