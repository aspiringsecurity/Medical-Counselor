import {
  useState,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect
} from 'react';

import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAtomValue, useSetAtom } from 'jotai';
import {
  setCurrentSubstrateAccountAtom,
  substrateAccountAtom,
  disconnectSubstrateAccountAtom
} from 'store/substrateAccount';
import { disconnectCurrentUserAtom } from 'store/db';
import { keyringAtom } from 'store/api';
import { wallets } from 'constants/wallets';

import type { WalletMeta, WalletName, WalletSource } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from 'components/ui-kit/DropdownMenu';

import styles from './ConnectWallet.module.scss';

const ACCOUNT_MAP = {
  alice: 'Aiko',
  bob: 'Bob',
  charlie: 'Carol',
  dave: 'Dave',
  eve: 'Eve',
  ferdie: 'Hassan'
};

export function ConnectWallet() {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState<WalletSource | null>(
    null
  );
  const [selectedAccountAddress, setSelectedAccountAddress] =
    useState<string>('');

  const currentSubstrateAccount = useAtomValue(substrateAccountAtom);
  const keyring = useAtomValue(keyringAtom);
  const setSubstrateAccount = useSetAtom(setCurrentSubstrateAccountAtom);
  const disconnectSubstrateAccount = useSetAtom(disconnectSubstrateAccountAtom);
  const disconnectCurrentUser = useSetAtom(disconnectCurrentUserAtom);

  useEffect(() => {
    if (selectedAccountAddress) {
      const foundAccount = keyring
        ?.getPairs()
        .find((_account) => _account.address === selectedAccountAddress);

      if (!foundAccount) {
        return;
      }

      setSubstrateAccount(foundAccount);
      setSelectedAccountAddress('');
      setSelectedWallet(null);
    }
  }, [keyring, selectedAccountAddress, setSubstrateAccount]);

  const handleDisconnect = async () => {
    disconnectSubstrateAccount();
    disconnectCurrentUser();
    router.push('/login');
  };

  const handleWalletConnect = async (targetText: WalletName) => {
    if (!keyring) {
      return;
    }

    switch (targetText) {
      case 'Development Accounts': {
        setSelectedWallet('development');
        return;
      }
      default: {
        // eslint-disable-next-line no-console
        console.error('No such wallet exists.');
      }
    }
  };

  const handleOnWalletClick: MouseEventHandler<HTMLUListElement> = (e) => {
    const targetWallet = (e.target as HTMLLIElement).getAttribute(
      'data-wallet'
    );

    if (!targetWallet) {
      return;
    }
    handleWalletConnect(targetWallet as WalletName);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') {
      return;
    }

    const targetWallet = (e.target as HTMLLIElement).getAttribute(
      'data-wallet'
    );
    if (!targetWallet) {
      return;
    }

    handleWalletConnect(targetWallet as WalletName);
  };

  const handleCopyAddress = () => {
    if (currentSubstrateAccount) {
      navigator.clipboard.writeText(currentSubstrateAccount.address);
    }
  };

  let visualAddress;

  if (currentSubstrateAccount) {
    visualAddress =
      ACCOUNT_MAP[currentSubstrateAccount.meta.name?.toString()] ??
      currentSubstrateAccount.address;
  }

  const accounts = keyring?.getPairs();

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedWallet(null);
    }
  };

  const onAccountValueChange = (_account: string) => {
    setSelectedAccountAddress(_account);
  };

  let currentWallet: WalletMeta | undefined;
  if (currentSubstrateAccount) {
    currentWallet = wallets.find(
      (_wallet) =>
        _wallet.source ===
        (currentSubstrateAccount?.meta.source ?? 'development')
    );
  }

  return currentSubstrateAccount ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outlined" className={styles.button}>
          {currentWallet && (
            <Image
              src={currentWallet.icon}
              alt={ACCOUNT_MAP[currentWallet.name]}
              width={24}
              height={24}
            />
          )}
          {visualAddress}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={styles['dropdown-content']}>
        <DropdownMenuLabel asChild>
          <span className={styles['dropdown-title']}>
            <Typography
              variant="body2"
              className={styles['dropdown-title-text']}
            >
              {visualAddress ?? 'Please select a wallet to continue'}
            </Typography>
            {visualAddress && (
              <Button variant="icon" size="xs" onClick={handleCopyAddress}>
                <Icon name="copy" size="xs" />
              </Button>
            )}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={handleDisconnect}>
          <span className={styles['disconnect-button']}>
            <Typography variant="title4">Disconnect</Typography>
            <span className={styles['disconnect-icon']}>
              <Icon name="logout" size="xs" />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Dialog onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button variant="filled" className={styles.button}>
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle asChild>
          <Typography variant="title1">Connect wallet</Typography>
        </DialogTitle>
        <div className={styles['wallets-content']}>
          {selectedWallet ? (
            <Select onValueChange={onAccountValueChange}>
              <SelectTrigger className={styles.trigger}>
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  ?.filter(
                    (_account) =>
                      _account.meta.source ===
                      (selectedWallet === 'development'
                        ? undefined
                        : selectedWallet)
                  )
                  .map((_account) => (
                    <SelectItem value={_account.address} key={_account.address}>
                      <Typography variant="button2">
                        {ACCOUNT_MAP[_account.meta.name as string] ||
                          (_account.meta.name as string)}
                      </Typography>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <ul
              className={styles.wallets}
              onClick={handleOnWalletClick}
              onKeyDown={handleKeyDown}
              role="presentation"
            >
              {wallets.map((_wallet) => (
                <li key={_wallet.name}>
                  <Button
                    fullWidth
                    variant="outlined"
                    className={styles['wallet-button']}
                    data-wallet={_wallet.name}
                  >
                    <Image
                      src={_wallet.icon}
                      alt={_wallet.name}
                      width={24}
                      height={24}
                    />
                    <Typography variant="title4">{_wallet.name}</Typography>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
