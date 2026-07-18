// Mock file system module for Webpack browser bundle to avoid runtime crashes and named import errors
export const promises = {
  readFile: async () => '',
  writeFile: async () => {},
  stat: async () => ({}),
};

export const readFileSync = () => '';
export const existsSync = () => false;
export const readFile = () => {};
export const writeFile = () => {};
export const writeFileSync = () => {};
export const statSync = () => ({});
export const createReadStream = () => ({});
export const createWriteStream = () => ({});

const defaultMock = {
  promises,
  readFileSync,
  existsSync,
  readFile,
  writeFile,
  writeFileSync,
  statSync,
  createReadStream,
  createWriteStream,
};

export default defaultMock;
