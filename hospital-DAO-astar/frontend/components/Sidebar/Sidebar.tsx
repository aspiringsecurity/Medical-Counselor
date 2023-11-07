import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentSubstrateAccountAtom } from 'store/substrateAccount';

import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';
import { Avatar } from 'components/ui-kit/Avatar';

import { Project } from 'db/projects';
import { projectsAtom, usersAtom } from 'store/db';
import { projectIdsAtom } from 'store/api';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const router = useRouter();
  const currentAccount = useAtomValue(currentSubstrateAccountAtom);
  const projectIds = useAtomValue(projectIdsAtom);
  const projects = useAtomValue(projectsAtom);
  const setProjects = useSetAtom(projectsAtom);
  const setUsers = useSetAtom(usersAtom);

  const projectId = router.query.id as string;

  const getProjects = async () => {
    const response = await fetch('/api/projects');
    const dbProjects = (await response.json()) as Project[];

    setProjects(
      dbProjects.filter((project) => projectIds.includes(project.id as number))
    );
  };

  const getUsers = useCallback(async () => {
    const response = await fetch('/api/users');
    const apiUsers = await response.json();
    setUsers(apiUsers);
  }, [setUsers]);

  useEffect(() => {
    if (!projectIds.length) {
      return;
    }

    getProjects();
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIds]);

  if (!currentAccount) {
    return null;
  }

  return (
    <aside className={styles.root}>
      <span className={styles['logo-container']}>
        <Link href="/">
          <span className={styles.logo}>
            <Image src="/logo/toyota-square.svg" alt="toyota-square" fill />
          </span>
        </Link>
      </span>

      <ul className={styles['center-container']}>
        {projects?.map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}/dashboard`}
              active={!!projectId && parseInt(projectId, 10) === project.id}
              variant="nav"
            >
              <span className={styles['button-logo']}>
                <Avatar value={project.name} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles['bottom-container']}>
        <Link href="/create-project" variant="outlined">
          <Icon name="add" />
        </Link>
      </div>
    </aside>
  );
}
