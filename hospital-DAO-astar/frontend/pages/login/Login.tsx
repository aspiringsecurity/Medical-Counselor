import { Button } from 'components/ui-kit/Button';
import { Card } from 'components/ui-kit/Card';
import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';
import { User } from 'db/users';
import { useAtomValue, useSetAtom } from 'jotai';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { currentUserAtom, setCurrentUserAtom } from 'store/db';
import styles from './Login.module.scss';

type Creds = {
  email: string;
  password: string;
};
export default function Login() {
  const router = useRouter();
  const user = useAtomValue(currentUserAtom);
  const setUser = useSetAtom(setCurrentUserAtom);
  const [creds, setCreds] = useState<Creds>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const onInputChange = (field: string, value: string) => {
    setError(null);
    setCreds({ ...creds, [field]: value });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!creds.email || !creds.password) {
      setError('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      });

      if (response.status === 200) {
        const loggedInUser = (await response.json()) as User;
        setUser(loggedInUser);
      } else {
        const err = await response.json();
        setError(err.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  });
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Card className={styles.card}>
          <div className={styles.logos}>
            <Image
              src="/logo/toyota.svg"
              width={1}
              height={1}
              alt="Toyota logo"
            />
            <Image
              src="/logo/astar.png"
              width={500}
              height={250}
              alt="Astar logo"
            />
          </div>

          <Typography variant="title1" className={styles['margin-bottom']}>
            Sign In To Project App
          </Typography>
          <form onSubmit={handleLogin}>
            <Input
              name="email"
              label="Email"
              value={creds.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              type="email"
              required
            />
            <Input
              name="password"
              label="Password"
              value={creds.password}
              onChange={(e) => onInputChange('password', e.target.value)}
              type="password"
              required
            />

            {!!error && (
              <Typography variant="value4" className={styles.error}>
                {error}
              </Typography>
            )}
            <Button className={styles['login-btn']} type="submit">
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
