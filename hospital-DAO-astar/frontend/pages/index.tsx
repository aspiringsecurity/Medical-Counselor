import { useAtomValue } from 'jotai';
import Head from 'next/head';

import { currentSubstrateAccountAtom } from 'store/substrateAccount';
import Overview from 'components/Overview';
import { Hero } from 'components/Hero';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { projectsAtom } from 'store/db';

export default function Home() {
  const currentSubstrateAccount = useAtomValue(currentSubstrateAccountAtom);
  const projects = useAtomValue(projectsAtom);
  const router = useRouter();

  useEffect(() => {
    if (!projects?.length || !currentSubstrateAccount) {
      return;
    }

    router.push(`/projects/${projects[0].id}/dashboard`);
  }, [currentSubstrateAccount, projects, router]);

  return (
    <>
      <Head>
        <title>OkAlice DAO Projects app</title>
        <meta name="description" content="OKAlice DAO Projects App" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {currentSubstrateAccount ? <Overview /> : <Hero />}
    </>
  );
}
