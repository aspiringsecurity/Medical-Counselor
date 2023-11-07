import { Typography } from 'components/ui-kit/Typography';
import { Message } from 'db/discussions';
import { useAtomValue } from 'jotai';
import { usersAtom } from 'store/db';

import styles from './Discussions.module.scss';

interface MessageProps {
  message: Message;
}
export default function DiscussionMessage({ message }: MessageProps) {
  const users = useAtomValue(usersAtom);
  const user = users?.find((_user) => _user.id === message.userId);
  const date = new Date(message.timestamp);
  return (
    <div className="event">
      <div className="content">
        <div className={styles.summary}>
          <Typography variant="title5">{user?.displayName}</Typography>
          <Typography variant="value8">{`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`}</Typography>
        </div>
        <div className="message">{message.message}</div>
      </div>
    </div>
  );
}
