import discussionData from './data/discussions.json';
import { saveData } from './utils';

export type Message = {
  id: number;
  userId: number;
  message: string;
  timestamp: string;
};

export type Discussion = {
  id: number;
  projectId: number;
  messages: Message[];
};

const getDiscussion = (projectId: number) =>
  discussionData.find((x) => x.projectId === projectId);

const createDiscussion = (projectId: number) => {
  const newDiscussion = {
    id: discussionData.length || 0,
    projectId,
    messages: []
  };

  discussionData.push(newDiscussion);
  saveData(discussionData, 'discussions.json');
  return newDiscussion;
};

const addMessage = (projectId: number, message: string, userId: number) => {
  let discussion = getDiscussion(projectId);

  if (!discussion) {
    discussion = {
      id: discussionData.length || 0,
      projectId,
      messages: []
    };

    discussionData.push(discussion);
  }

  const newMessage = {
    id: discussion.messages.length,
    userId,
    message,
    timestamp: new Date().toISOString()
  };

  discussion.messages.push(newMessage);

  saveData(discussionData, 'discussions.json');
  return newMessage;
};

export const discussionsDB = {
  get: getDiscussion,
  addMessage,
  createDiscussion
};
