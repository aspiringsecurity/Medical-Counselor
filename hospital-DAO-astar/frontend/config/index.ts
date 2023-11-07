import assert from 'assert';

export type AppConfig = {
  appName: string;
  providerSocket: string;
  customRPCMethods?: object;
  proposalVotingDelay: number;
  proposalVotingPeriod: number;
  projectContractAddress: string;
  employeeContractAddress: string;
  employeeFunctionContractAddress: string;
  employeeProjectContractAddress: string;
};

const appName = process.env.NEXT_PUBLIC_APP_NAME;
const providerSocket = process.env.NEXT_PUBLIC_PROVIDER_SOCKET;
const proposalVotingDelay = process.env.NEXT_PUBLIC_PROPOSAL_VOTING_DELAY;
const proposalVotingPeriod = process.env.NEXT_PUBLIC_PROPOSAL_VOTING_PERIOD;
const projectContractAddress = process.env.NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS;
const employeeContractAddress =
  process.env.NEXT_PUBLIC_EMPLOYEE_CONTRACT_ADDRESS;
const employeeFunctionContractAddress =
  process.env.NEXT_PUBLIC_EMPLOYEE_FUNCTION_CONTRACT_ADDRESS;
const employeeProjectContractAddress =
  process.env.NEXT_PUBLIC_EMPLOYEE_PROJECT_CONTRACT_ADDRESS;

assert(appName, 'NEXT_PUBLIC_APP_NAME was not provided.');
assert(providerSocket, 'NEXT_PUBLIC_PROVIDER_SOCKET was not provided.');
assert(
  proposalVotingDelay,
  'NEXT_PUBLIC_PROPOSAL_VOTING_DELAY was not provided.'
);
assert(
  proposalVotingPeriod,
  'NEXT_PUBLIC_PROPOSAL_VOTING_PERIOD was not provided.'
);
assert(
  projectContractAddress,
  'NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS was not provided.'
);
assert(
  employeeContractAddress,
  'NEXT_PUBLIC_EMPLOYEE_CONTRACT_ADDRESS was not provided.'
);
assert(
  employeeFunctionContractAddress,
  'NEXT_PUBLIC_EMPLOYEE_FUNCTION_CONTRACT_ADDRESS was not provided.'
);
assert(
  employeeProjectContractAddress,
  'NEXT_PUBLIC_EMPLOYEE_PROJECT_CONTRACT_ADDRESS was not provided.'
);

export const appConfig: AppConfig = {
  appName,
  providerSocket,
  proposalVotingDelay: parseInt(proposalVotingDelay, 10),
  proposalVotingPeriod: parseInt(proposalVotingPeriod, 10),
  projectContractAddress,
  employeeContractAddress,
  employeeFunctionContractAddress,
  employeeProjectContractAddress
};
