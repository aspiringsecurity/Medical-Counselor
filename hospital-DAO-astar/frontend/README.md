# okAlice Toyota Hachkathon Frontend

## Getting Started

First, install packages (node v19)

```bash
yarn install
```

Create .env file with needed variables, ex:

```bash
NEXT_PUBLIC_APP_NAME=client
NEXT_PUBLIC_PROVIDER_SOCKET=ws://127.0.0.1:9944
NEXT_PUBLIC_PROPOSAL_VOTING_DELAY=0
NEXT_PUBLIC_PROPOSAL_VOTING_PERIOD=10
NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS=0x000000
NEXT_PUBLIC_EMPLOYEE_CONTRACT_ADDRESS=0x000000
NEXT_PUBLIC_EMPLOYEE_PROJECT_CONTRACT_ADDRESS=0x000000
NEXT_PUBLIC_EMPLOYEE_FUNCTION_CONTRACT_ADDRESS=0x000000
```

Run the development server:

```bash
yarn dev
```

Build for production

```bash
yarn build
```

## Where to change files when you deploy our initial setup on swanky node

Modify contract addresses in .env

```
NEXT_PUBLIC_PROJECT_CONTRACT_ADDRESS=<contract_address>
NEXT_PUBLIC_EMPLOYEE_CONTRACT_ADDRESS=<contract_address>
NEXT_PUBLIC_EMPLOYEE_PROJECT_CONTRACT_ADDRESS=<contract_address>
NEXT_PUBLIC_EMPLOYEE_FUNCTION_CONTRACT_ADDRESS=<contract_address>
```

If needed, update contract metadata json files in /abis/ folder

Update JSON db files with projectIds, proposalIds and employeeIds given in backend deploy script

## Current state of on-chain/off-chain

We created everything with a mocked database first (see db/data) in order to create this UI.
Then we moved to get information from chain instead of the database.
This is an ongoing effort

Project and proposal information is fetched from chain
accounts gets fetched from keyring and then matched with off-chain mocked database
for projects see -> components/DataLoader
for proposals see -> components/TaskBoard

Create Project will create the project off-chain but will not create it on-chain so you will see an error
when getting the proposals

Create Proposal will create a proposal off-chain but will not create it on-chain so you will never see it in the UI
since it filters on on-chain proposal Ids
