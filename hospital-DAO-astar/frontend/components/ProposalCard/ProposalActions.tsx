import { useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Typography } from 'components/ui-kit/Typography';

import { currentProjectAtom, currentUserAtom } from 'store/db';
import { ProjectProposal } from 'components/ProposalBoard/types';

import styles from './ProposalCard.module.scss';

type ProposalActionsProps = { proposal: ProjectProposal };

export function ProposalActions({ proposal }: ProposalActionsProps) {
  const currentUser = useAtomValue(currentUserAtom);
  const currentProject = useAtomValue(currentProjectAtom);
  const setCurrentProject = useSetAtom(currentProjectAtom);
  const [ayes, setAyes] = useState<number>(proposal.votesFor);
  const [nays, setNays] = useState<number>(proposal.votesAgainst);
  const [abstains, setAbstains] = useState<number>(proposal.votesAbstain);

  const castVote = async (vote: 'yes' | 'no' | 'abstain') => {
    await fetch(
      `/api/projects/${currentProject?.id}/proposals/${proposal.id}/vote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote })
      }
    );
    const response = await fetch(`/api/projects/${currentProject?.id}`);
    const project = await response.json();
    setCurrentProject(project);
  };

  const handleVoteYes = async () => {
    await castVote('yes');
  };
  const handleVoteNo = async () => {
    await castVote('no');
  };
  const handleVoteAbstain = async () => {
    await castVote('abstain');
  };

  // const onAyeVoteSuccess: TxCallback = () => {
  //   toast.success(
  //     <Notification
  //       title="Vote created"
  //       body="You've voted Aye for proposal."
  //       variant="success"
  //     />
  //   );
  // };

  // const onNayVoteSuccess: TxCallback = () => {
  //   toast.success(
  //     <Notification
  //       title="Vote created"
  //       body="You've voted Nay for proposal."
  //       variant="success"
  //     />
  //   );
  // };

  const disabled =
    proposal.status !== 'Active' ||
    !currentProject?.members?.find(
      (member) => member.userId === currentUser?.id
    );

  useEffect(() => {
    setAyes(proposal.votesFor);
    setNays(proposal.votesAgainst);
    setAbstains(proposal.votesAbstain);
  }, [proposal]);
  return (
    <div className={styles['proposal-vote-buttons']}>
      <div className={styles['proposal-vote-button-container']}>
        <Button
          variant="ghost"
          disabled={disabled}
          className={styles['button-vote']}
          onClick={handleVoteNo}
          title="No"
        >
          <Icon name="vote-no" />
        </Button>

        <Typography variant="caption2">{nays || 0}</Typography>
      </div>

      <div className={styles['vertical-break']} />
      <span className={styles['proposal-vote-button-container']}>
        {/* <TxButton
          disabled={disabled}
          accountId={substrateAccount?.address}
          tx={api?.tx.daoCouncil.vote}
          params={[proposal.dao.id, proposal.hash, proposal.index, true]}
          variant="ghost"
          className={styles['button-vote']}
          onSuccess={onAyeVoteSuccess}
        >
          <Icon name="vote-yes" />
        </TxButton> */}
        <Button
          variant="ghost"
          disabled={disabled}
          className={styles['button-vote']}
          onClick={handleVoteYes}
          title="Yes"
        >
          <Icon name="vote-yes" />
        </Button>

        <Typography variant="caption2">{ayes || 0}</Typography>
      </span>
      <div className={styles['vertical-break']} />
      <span className={styles['proposal-vote-button-container']}>
        {/* <TxButton
          disabled={disabled}
          accountId={substrateAccount?.address}
          tx={api?.tx.daoCouncil.vote}
          params={[proposal.dao.id, proposal.hash, proposal.index, true]}
          variant="ghost"
          className={styles['button-vote']}
          onSuccess={onAyeVoteSuccess}
        >
          <Icon name="vote-yes" />
        </TxButton> */}
        <Button
          variant="ghost"
          disabled={disabled}
          className={styles['button-vote']}
          onClick={handleVoteAbstain}
          title="Abstain"
        >
          <Icon name="close" />
        </Button>

        <Typography variant="caption2">{abstains || 0}</Typography>
      </span>
    </div>
  );
}
