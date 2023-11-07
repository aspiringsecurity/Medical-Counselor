import { MouseEventHandler, useEffect, useState } from 'react';

import { useAtomValue } from 'jotai';
import { currentProjectAtom } from 'store/db';
import { apiAtom, blockNumberAtom, projectContractAtom } from 'store/api';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { ProposalCard } from 'components/ProposalCard';

import { contractQuery, parseToInt } from 'helpers';
import { substrateAccountAddressAtom } from 'store/substrateAccount';
import { Proposal } from 'db/proposals';
import styles from './ProposalBoard.module.scss';
import { ProjectProposal } from './types';

type FilterVariant = 'All' | 'In Progress' | 'Completed';

type FilterOption = {
  title: FilterVariant;
};

const filterOptions: FilterOption[] = [
  { title: 'All' },
  { title: 'In Progress' },
  { title: 'Completed' }
];

export function ProposalBoard() {
  const api = useAtomValue(apiAtom);
  const projectContract = useAtomValue(projectContractAtom);
  const currentProject = useAtomValue(currentProjectAtom);
  const currentAccountAddress = useAtomValue(substrateAccountAddressAtom);
  const blockNumber = useAtomValue(blockNumberAtom);
  const [proposalIds, setProposalIds] = useState<number[]>([]);
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [filter, setFilter] = useState<FilterVariant>('All');

  const handleFilterClick: MouseEventHandler<HTMLButtonElement> = (e) =>
    setFilter((e.target as HTMLButtonElement).innerText as FilterVariant);

  const getProposalIds = async () => {
    if (!projectContract || !currentAccountAddress) return;
    const { decodedOutput, result } = await contractQuery(
      projectContract,
      api.registry,
      currentAccountAddress,
      'listProposalIds',
      [currentProject?.id]
    );

    if (result.isOk) {
      const _proposalIds = decodedOutput.Ok.map(parseToInt);
      console.log('proposalIds', _proposalIds);
      setProposalIds(_proposalIds);
    }
  };

  const getProposals = async () => {
    if (!projectContract || !currentAccountAddress) return;

    const promises = proposalIds.map(async (id) => {
      // get proposal details from chain
      const { decodedOutput: detailsOutput } = await contractQuery(
        projectContract,
        api.registry,
        currentAccountAddress,
        'proposalDetails',
        [currentProject?.id, id]
      );
      const details = detailsOutput.Ok;
      details.voteEnd = parseToInt(details.voteEnd);
      details.voteStart = parseToInt(details.voteStart);

      // get proposal status from chain
      const { decodedOutput: statusOutput } = await contractQuery(
        projectContract,
        api.registry,
        currentAccountAddress,
        'proposalState',
        [currentProject?.id, id]
      );
      const status = statusOutput.Ok;

      // get proposal vote status from chain
      const { decodedOutput: voteStatusOutput } = await contractQuery(
        projectContract,
        api.registry,
        currentAccountAddress,
        'proposalVotes',
        [currentProject?.id, id]

        // get proposal info from db
      );
      const voteStatus = voteStatusOutput.Ok;
      voteStatus.votesAbstain = parseToInt(voteStatus.votesAbstain);
      voteStatus.votesAgainst = parseToInt(voteStatus.votesAgainst);
      voteStatus.votesFor = parseToInt(voteStatus.votesFor);

      const response = await fetch(
        `/api/projects/${currentProject?.id}/proposals/${id}`
      );
      const proposal: Proposal = await response.json();

      return {
        id,
        ...details,
        status,
        ...voteStatus,
        title: proposal.title,
        description: proposal.description,
        proposer: proposal.proposer
      };
    });
    const _proposals: ProjectProposal[] = await Promise.all(promises);

    setProposals(_proposals);
  };

  useEffect(() => {
    if (!currentProject) {
      return;
    }
    getProposalIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  useEffect(() => {
    if (!proposalIds.length) return;
    getProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalIds, blockNumber]);

  return (
    <>
      <Card className={styles['header-card']}>
        <Typography variant="title4">Task Board</Typography>
        <div className={styles['filter-container']}>
          {currentProject &&
            filterOptions.map((_filterOption) => (
              <Button
                data-active={filter === _filterOption.title}
                key={_filterOption.title}
                variant="nav"
                onClick={handleFilterClick}
              >
                <Typography variant="title7">{_filterOption.title}</Typography>
              </Button>
            ))}
        </div>
      </Card>
      {proposals.length > 0 ? (
        proposals
          .filter((proposal) => {
            if (filter === 'Completed') {
              return proposal.status !== 'Active';
            }
            if (filter === 'In Progress') {
              return proposal.status === 'Active';
            }
            return proposal;
          })
          .map((proposal) => (
            <ProposalCard
              key={`${proposal.title}-${proposal.id}`}
              proposal={proposal}
            />
          ))
      ) : (
        <Card className={styles['proposals-empty-card']}>
          <Typography variant="caption2" className={styles.caption}>
            You don&apos;t have any proposals yet
          </Typography>
        </Card>
      )}
    </>
  );
}
