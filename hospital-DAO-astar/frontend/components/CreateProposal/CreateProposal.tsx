import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { substrateAccountAddressAtom } from 'store/substrateAccount';

import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';

import { Notification } from 'components/ui-kit/Notifications';
import { Icon } from 'components/ui-kit/Icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';

import { State } from './types';
import { ProposalInputs } from './ProposalInputs';

import styles from './CreateProposal.module.scss';

export interface CreateProposalProps {
  projectId: number;
}

const INITIAL_STATE: State = {
  description: '',
  title: '',
  internal: false
};

export function CreateProposal({ projectId }: CreateProposalProps) {
  const api = useAtomValue(apiAtom);
  const substrateAccountAddress = useAtomValue(substrateAccountAddressAtom);
  const [modalOpen, setModalOpen] = useState(false);
  const [state, setState] = useState<State>(INITIAL_STATE);
  const [curBlockNumber, setCurBlockNumber] = useState<number>(0);

  const proposalCreatedHandler = useCallback(() => {
    setTimeout(
      () =>
        toast.success(
          <Notification
            title="Proposal created"
            body="Proposal was created."
            variant="success"
          />
        ),
      1000
    );
    setState(INITIAL_STATE);
    setModalOpen(false);
  }, []);

  const handleCancelClick = () => setModalOpen(false);

  const disabled = !state.title || !state.description;

  const onSuccess = () => proposalCreatedHandler();

  const handleCreateClick = async () => {
    if (disabled) return;

    const newProposal = {
      ...state,
      createdAtBlock: curBlockNumber,
      proposer: substrateAccountAddress
    };
    try {
      const response = await fetch(`/api/projects/${projectId}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProposal)
      });

      if (!response.ok) {
        throw new Error('Failed to create prposal');
      }

      onSuccess();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    let unsubscribe: any | null = null;

    api?.derive.chain
      .bestNumber((number) => {
        setCurBlockNumber(number.toNumber());
      })
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api]);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <span className={styles['button-content']}>
            <Icon name="proposals-add" size="sm" />
            <Typography variant="button1">Create Proposal</Typography>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className={styles['dialog-content']} closeIcon={false}>
        <DialogTitle asChild>
          <Typography className={styles.title} variant="title1">
            Create Proposal
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <div className={styles.container}>
            <div className={styles.content}>
              <ProposalInputs state={state} setState={setState} />
              <div className={styles['buttons-container']}>
                <Button
                  variant="text"
                  color="destructive"
                  onClick={handleCancelClick}
                >
                  Cancel
                </Button>

                <Button
                  variant="filled"
                  color="destructive"
                  disabled={disabled}
                  onClick={handleCreateClick}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
