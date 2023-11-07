import type { Href } from 'types';

export function formLinkByProjectId(projectId: string, href: Href) {
  return `/projects/${projectId}/${href}`;
}
