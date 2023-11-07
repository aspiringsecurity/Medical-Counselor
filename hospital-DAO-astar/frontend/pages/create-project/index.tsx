import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtomValue } from 'jotai';
import { currentSubstrateAccountAtom } from 'store/substrateAccount';

import { CreateProject } from 'components/Createproject';

export default function CreateProjectPage() {
  const router = useRouter();
  const currentAccount = useAtomValue(currentSubstrateAccountAtom);

  useEffect(() => {
    if (!currentAccount) {
      router.push('/');
    }
  }, [currentAccount, router]);

  return <CreateProject />;
}
