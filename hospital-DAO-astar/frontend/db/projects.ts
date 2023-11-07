import { Proposal } from './proposals';
import projectData from './data/projects.json';
import proposalData from './data/proposals.json';
import { saveData } from './utils';

export type Member = {
  userId: number;
  role: string;
  voteWeight: string;
};
export type Project = {
  id?: number;
  name: string;
  description: string;
  attribute: string;
  members?: Member[];
  proposals?: number[];
};

const getProposals = (projectId: number) =>
  proposalData.find((proposal: Proposal) => proposal.projectId === projectId);

const getProject = (id: number) => {
  const project = projectData.find((x) => x.id === id);
  if (!project) return null;
  return { ...project, proposals: getProposals(project.id) };
};

const createProject = (
  name: string,
  description: string,
  attribute: string,
  members: number[]
) => {
  const project = {
    id: projectData.length,
    name,
    description,
    attribute,
    members
  };
  // @ts-ignore
  projectData.push(project);
  saveData(projectData, 'projects.json');
  return project;
};

export const projectsDB = {
  list: projectData as Project[],
  get: getProject,
  create: createProject
};
