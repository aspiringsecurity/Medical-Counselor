import { atom } from 'jotai';
import { Project } from 'db/projects';
import { User } from 'db/users';

export const USER_STORAGE_KEY = 'userStorageKey';

export const projectsAtom = atom<Project[] | null>(null);
export const currentProjectAtom = atom<Project | null>(null);

export const usersAtom = atom<User[] | null>(null);
export const userAtom = atom<User | null>(null);
export const setCurrentUserAtom = atom(null, (_get, _set, _user: User) => {
  _set(userAtom, _user);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(_user));
});
export const currentUserAtom = atom((_get) => _get(userAtom));
export const disconnectCurrentUserAtom = atom(null, (_get, _set) => {
  localStorage.removeItem(USER_STORAGE_KEY);
  _set(userAtom, null);
});
