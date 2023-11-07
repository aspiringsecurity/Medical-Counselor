import { Button } from 'components/ui-kit/Button';
import { Card } from 'components/ui-kit/Card';
import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';
import { Message } from 'db/discussions';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { currentProjectAtom, currentUserAtom } from 'store/db';
import DiscussionMessage from './DiscussionMessage';

import styles from './Discussions.module.scss';

export function Discussions() {
  const currentProject = useAtomValue(currentProjectAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const [curMessage, setCurMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurMessage(e.target.value);
  };

  const getMessages = async () => {
    const response = await fetch(
      `/api/projects/${currentProject?.id}/discussion`
    );
    const discussion = await response.json();
    setMessages(discussion.messages);
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await fetch(`/api/projects/${currentProject?.id}/discussion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: curMessage,
        userId: currentUser?.id
      })
    });
    await getMessages();
    setCurMessage('');
  };

  useEffect(() => {
    if (!currentProject) return;
    getMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject]);

  useEffect(() => {
    // find message div and scroll to bottom
    const messageDiv = document.querySelector('#message-container');

    if (messageDiv) {
      messageDiv.scrollTop = messageDiv.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      getMessages();
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card className={styles['discussions-card']}>
        <Typography variant="title4">Project Discussions</Typography>

        <div className={styles['messages-container']} id="message-container">
          <div className={styles.messages}>
            {messages.map((message) => (
              <DiscussionMessage key={message.id} message={message} />
            ))}
          </div>
        </div>
      </Card>

      <Card className={styles['message-card']}>
        <Typography variant="title4">Send Message</Typography>
        <form
          noValidate
          onSubmit={sendMessage}
          className={styles['message-input']}
        >
          <Input
            name="message"
            label="Message"
            onChange={onChange}
            value={curMessage}
            maxLength={500}
            hint={
              <Typography variant="caption3">
                {curMessage.length}/500
              </Typography>
            }
            hintPosition="end"
            required
          />
          <Button className={styles['send-message-btn']} type="submit">
            Send Message
          </Button>
        </form>
      </Card>
    </>
  );
}
