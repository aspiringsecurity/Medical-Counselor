import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentProjectAtom } from 'store/db';

import { About } from 'components/About';
import { Members } from 'components/Members';
import { ProposalBoard } from 'components/ProposalBoard';
import { currentSubstrateAccountAtom } from 'store/substrateAccount';

import styles from 'styles/pages/dashboard.module.scss';

export default function ProjectDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const currentProject = useAtomValue(currentProjectAtom);
  const setCurrentProject = useSetAtom(currentProjectAtom);
  const currentSubstrateAccount = useAtomValue(currentSubstrateAccountAtom);

  // Get Project by id
  const getProject = async () => {
    setLoading(true);
    const response = await fetch(`/api/projects/${router.query.id}`);
    const data = await response.json();

    setLoading(false);
    setCurrentProject(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    if (!router.query.id) return;
    getProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.id]);

  useEffect(() => {
    if (currentSubstrateAccount) {
      return;
    }

    router.push(`/`);
  }, [currentSubstrateAccount, router]);

  if (loading) {
    // TODO @asanzyb create a loader
    return null;
  }

  return (
    <>
      <Head>
        <title>{currentProject?.name}</title>
      </Head>

      <div className={styles.container}>
        <div className={styles['left-container']}>
          <About />
        </div>
        <div className={styles['center-container']}>
          <ProposalBoard />
        </div>
        <div className={styles['right-container']}>
          <Members />
        </div>
      </div>
    </>
  );
}
