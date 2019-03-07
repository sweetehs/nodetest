import * as fs from 'fs';
import * as shelljs from 'shelljs';
import { gitroot, dataspath } from './config';
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
export const isExists = path => {
  return new Promise((r, j) => {
    fs.exists(path, value => {
      r(value);
    });
  });
};
// 获取项目路径
export const getRoot = data => {
  const { dirname, id } = data;
  return `${gitroot}/${dirname}_${id}`;
};
// 命令执行
export const exec = command => {
  return new Promise((resolve, reject) =>
    shelljs.exec(command, {}, (code, value, error) => {
      if (error && error.indexOf('npm ERR!') !== -1) {
        return reject(error);
      }
      resolve(value);
    }),
  );
};
