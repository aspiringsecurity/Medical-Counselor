import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { useAtom, useAtomValue } from 'jotai';
import { projectsAtom, usersAtom } from 'store/db';
import { Project } from 'db/projects';
import { substrateAccountAtom } from 'store/substrateAccount';

// import { useDaoContract } from 'hooks/useDaoContract';
// import { ssToEvmAddress } from 'utils/ssToEvmAddress';
// import { keyringAddExternal } from 'utils/keyringAddExternal';
// import { convertTimeToBlock } from 'utils/convertTimeToBlock';
// import { formLinkByDaoId } from 'utils/formLinkByDaoId';

// import { stringToHex } from '@polkadot/util';

// import type { Option, u32 } from '@polkadot/types';
// import type { CreateDaoInput, DaoCodec } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Notification } from 'components/ui-kit/Notifications';
// import { TxButton } from 'components/TxButton';
import { formLinkByProjectId } from 'utils/formLinkByProjectId';
import { InfoState, MembersState } from './types';
import { ProjectInfo } from './ProjectInfo';
import { ProjectMembers } from './ProjectMembers';
import { ProjectAttribute } from './ProjectAttribute';

// import { DaoToken } from './DaoToken';
// import { DaoGovernance } from './DaoGovernance';

import styles from './CreateProject.module.scss';

const initialInfoState: InfoState = {
  name: '',
  description: ''
};

export function CreateProject() {
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const router = useRouter();
  const [projectInfo, setProjectInfo] = useState<InfoState>(initialInfoState);
  const [projectMembers, setProjectMembers] = useState<MembersState>({
    members: [
      {
        address: substrateAccount?.address || '',
        role: 'Creator',
        voteWeight: '1'
      }
    ]
  });
  const [projectAttribute, setProjectAttribute] = useState<string>('');
  const [projects, setProjects] = useAtom(projectsAtom);
  const users = useAtomValue(usersAtom);

  const [createdProjectId, setCreatedProjectId] = useState<number | null>(null);
  const [proposedProjectId, setProposedProjectId] = useState<number | null>(
    null
  );
  const createdRef = useRef<boolean>(false);

  const getProjects = async () => {
    const response = await fetch('/api/projects');
    const apiProjects = (await response.json()) as Project[];
    setProjects(apiProjects);
  };

  useEffect(() => {
    if (!createdRef.current || createdProjectId === null) {
      return;
    }

    const currentProject = projects?.find(
      (project) => project.id === createdProjectId
    );

    if (!currentProject) {
      return;
    }

    toast.success(
      <Notification
        title="You've successfully created a new Project"
        body="You can now create/discuss proposals in the project."
        variant="success"
      />
    );
    router.push(
      formLinkByProjectId(currentProject?.id?.toString() || '', 'dashboard')
    );
  }, [createdProjectId, projects, router]);

  useEffect(() => {
    if (proposedProjectId === null) {
      return undefined;
    }

    setCreatedProjectId(proposedProjectId);
    return undefined;
  }, [proposedProjectId]);

  const handleOnSuccess = async () => {
    createdRef.current = true;

    const parsedMembers = projectMembers.members.map((member) => ({
      userId: users?.find((user) => user.address === member.address)?.id,
      role: member.role,
      voteWeight: member.voteWeight
    }));
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectInfo.name,
          description: projectInfo.description,
          members: parsedMembers,
          attribute: projectAttribute
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      toast.success(
        <Notification
          title="Transaction created"
          body="Project will be created soon."
          variant="success"
        />
      );
      const createdProject = (await response.json()) as Project;
      await getProjects();
      setProposedProjectId(createdProject.id as number);
    } catch (e) {
      console.log(e);
    }
  };

  const disabled =
    !projectInfo.name ||
    !projectInfo.description ||
    !projectMembers.members[0].address;

  return (
    <div className={styles.container}>
      <Link href="/projects/0/dashboard/" className={styles['cancel-button']}>
        <Button variant="outlined" color="destructive" size="sm">
          Cancel Project creation
        </Button>
      </Link>

      <div className={styles.content}>
        <Typography variant="h1" className={styles.title}>
          Create Project
        </Typography>

        <ProjectInfo state={projectInfo} setState={setProjectInfo} />
        <ProjectAttribute
          state={projectAttribute}
          setState={setProjectAttribute}
        />
        <ProjectMembers state={projectMembers} setState={setProjectMembers} />

        <div className={styles['create-proposal']}>
          <Button disabled={disabled} onClick={handleOnSuccess}>
            Create Project
          </Button>
        </div>
      </div>
    </div>
  );
}
