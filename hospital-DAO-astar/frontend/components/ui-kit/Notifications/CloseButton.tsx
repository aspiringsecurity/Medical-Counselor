import React from 'react';
import { Icon } from 'components/ui-kit/Icon';
import styles from './Notifications.module.scss';

interface CloseButtonProps {
  closeToast: (e: React.MouseEvent<HTMLElement>) => void;
}

export function CloseButton({ closeToast }: CloseButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={closeToast}>
      <Icon name="close" size="xs" />
    </button>
  );
}
