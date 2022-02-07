import { join } from 'path';

const ROOT = process.cwd() as string;
type PathBuilder = (...paths: string[]) => string;

export const fullPath = (...paths: string[]) => join(ROOT, ...paths);
export const mutate = (builder: PathBuilder, ...constPaths: string[]) => (...paths: string[]) => builder(...constPaths, ...paths);
