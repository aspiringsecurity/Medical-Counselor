// users in JSON file for simplicity, store in a db for production applications
import userData from './data/users.json';

export type User = {
  id: number;
  email: string;
  address: string;
  password?: string;
  displayName: string;
  nfts: {
    employee: number;
    employeeFunction: {
      nftId: number;
      function: string;
    };
    projects: number[];
  };
};

const getSanitizedUser = (user: User) => {
  const { password, ...cleanedUser } = user;
  return cleanedUser;
};

const list = () => userData.map(getSanitizedUser);

const get = (id: number) => {
  const foundUser = userData.find((user) => user.id === id);
  if (!foundUser) return null;
  return getSanitizedUser(foundUser);
};

const getByEmail = (email: string) => {
  const foundUser = userData.find((user) => user.email === email);
  if (!foundUser) return null;
  return foundUser;
};

export const usersDB = {
  list,
  get,
  getByEmail
};
