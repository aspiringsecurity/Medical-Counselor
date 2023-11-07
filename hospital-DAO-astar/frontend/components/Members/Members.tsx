import { MouseEventHandler } from 'react';
import { useAtomValue } from 'jotai';
import { currentProjectAtom, usersAtom } from 'store/db';

import { accountsAtom } from 'store/substrateAccount';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Chip } from 'components/ui-kit/Chip';
import { maskAddress } from 'utils/maskAddress';

import styles from './Members.module.scss';

export function Members() {
  const currentProject = useAtomValue(currentProjectAtom);
  const users = useAtomValue(usersAtom);
  const accounts = useAtomValue(accountsAtom);

  const getUser = (userId: number) => users?.find((user) => user.id === userId);
  const getAccount = (address: string) =>
    accounts?.find((account) => account.address === address);

  const handleOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const address = (e.target as HTMLButtonElement).getAttribute(
      'data-address'
    );
    if (!address) {
      return;
    }

    navigator.clipboard.writeText(address);
  };

  return (
    <Card className={styles.card}>
      <span className={styles.title}>
        <Typography variant="title4">Members</Typography>
      </span>

      <ul className={styles.members}>
        {currentProject?.members?.map((member) => {
          const user = getUser(member.userId);
          if (!user) return null;
          const account = getAccount(user.address);

          return (
            <li className={styles.member} key={user?.displayName}>
              <div className={styles.memberinfo}>
                <div className={styles.avatar}>
                  <embed src={`/nfts/employee/${user.nfts.employee}.svg`} />
                </div>
                <div>
                  <span>
                    <Typography
                      variant="title4"
                      className={styles['member-name']}
                    >
                      {user?.displayName || ''}
                    </Typography>
                  </span>
                  <span className={styles['member-address']}>
                    <Typography variant="title6">
                      {maskAddress(account?.address || '')}
                    </Typography>
                    <Button
                      variant="icon"
                      size="xs"
                      data-address={account?.address}
                      onClick={handleOnClick}
                    >
                      <Icon name="copy" size="xs" />
                    </Button>
                  </span>
                  <div className={styles.badges}>
                    <Chip
                      key={`${user.displayName}-${user.nfts.employeeFunction.function}`}
                      variant="group"
                      color="orange"
                    >
                      <Typography variant="title8">
                        {user.nfts.employeeFunction.function}
                      </Typography>
                    </Chip>

                    <Chip
                      key={`${user.displayName}-${member.role}`}
                      variant="group"
                      color="blue"
                    >
                      <Typography variant="title8">{member.role}</Typography>
                    </Chip>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
