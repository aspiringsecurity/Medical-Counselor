import { useRouter } from 'next/router';

import { useAtomValue } from 'jotai';
import { currentProjectAtom } from 'store/db';

import { formLinkByProjectId } from 'utils/formLinkByProjectId';

import type { Href } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { IconNamesType } from 'components/ui-kit/Icon';
import { Avatar } from 'components/ui-kit/Avatar';
import { NavLink } from 'components/ui-kit/NavLink';

import { CreateProposal } from '../CreateProposal';

import styles from './Subheader.module.scss';

type Navigation = {
  icon: IconNamesType;
  title: string;
  href: Href;
};

const navigations: Navigation[] = [
  {
    icon: 'dashboard',
    title: 'Dashboard',
    href: 'dashboard'
  },
  {
    icon: 'chat',
    title: 'Discussions',
    href: 'discussions'
  }
];

export function Subheader() {
  const router = useRouter();
  const { id: projectId } = router.query;
  const currentProject = useAtomValue(currentProjectAtom);

  if (!projectId || !currentProject) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div
        style={{
          background:
            'linear-gradient(164deg, rgba(172,4,140,1) 10%, rgba(236,12,28,1) 70%)'
        }}
        className={styles['top-container']}
      />
      <div className={styles['bottom-container']}>
        <div className={styles['left-container']}>
          <span className={styles['logo-container']}>
            <Avatar
              className={styles.logo}
              value={currentProject.name}
              radius="standard"
            />
          </span>
          <div className={styles['title-container']}>
            <Typography variant="title2">{currentProject.name}</Typography>
            <Typography variant="caption2">
              {currentProject?.members?.length}{' '}
              {currentProject?.members?.length &&
              currentProject.members.length > 1
                ? 'members'
                : 'member'}
            </Typography>
          </div>
        </div>
        <div className={styles['center-container']}>
          {navigations.map((_navigation) => (
            <NavLink
              key={_navigation.href}
              href={formLinkByProjectId(
                currentProject.id?.toString() || '',
                _navigation.href
              )}
              active={router.pathname.includes(_navigation.href)}
              icon={_navigation.icon}
              title={_navigation.title}
            />
          ))}
        </div>
        <div className={styles['right-container']}>
          {router.pathname.includes('create-proposal') ? null : (
            <CreateProposal projectId={parseInt(projectId as string, 10)} />
          )}
        </div>
      </div>
    </div>
  );
}
