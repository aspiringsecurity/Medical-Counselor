import React, { ReactNode } from 'react';
import { Icon, IconNamesType } from 'components/ui-kit/Icon';

import styles from './Notifications.module.scss';
import { Typography } from '../Typography';

type NotificationVariant = 'success' | 'warning' | 'error' | 'info';

type NotificationProps = {
  title: string;
  body: ReactNode;
  variant?: NotificationVariant;
};

const iconVariants: Record<NotificationVariant, IconNamesType> = {
  warning: 'noti-warning-filled',
  success: 'noti-success-filled',
  error: 'noti-error-filled',
  info: 'noti-info-filled'
};

export function Notification({
  title,
  body,
  variant = 'info'
}: NotificationProps) {
  const icon = iconVariants[variant];
  return (
    <div className={styles.root}>
      <Icon name={icon} className={styles[`icon-${variant}`]} />
      <div className={styles.content}>
        <Typography variant="title3">{title}</Typography>
        <Typography variant="body2">{body}</Typography>
      </div>
    </div>
  );
}
