import * as fs from 'fs';
export const read = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, filelist) => {
      resolve(JSON.parse(filelist || '[]'));
    });
  });
};
export const write = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data), () => {
      resolve();
    });
  });
};
