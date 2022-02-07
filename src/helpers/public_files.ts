import { fullPath, mutate } from './full_path';

const publicFile = mutate(fullPath, 'public');

export const PublicFiles = {
  Empty: publicFile('emptyfile'),
};
