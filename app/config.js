import configYaml from 'config-yaml';
import { remote } from 'electron';
import path from 'path';
import yaml from 'write-yaml';

const CONFIG_FILE_PATH = path.join(remote.app.getPath('home'), 'collaboratoire2-config.yml');

let config;

export const get = () => config;
export const set = _ => (config = _);

export const fromConfigFile = () => {
  try {
    config = configYaml(CONFIG_FILE_PATH);
  } catch (e) {
    config = {};
  }
};

export const toConfigFile = () => {
  yaml.sync(CONFIG_FILE_PATH, config);
  remote.app.relaunch();
  remote.app.exit();
};

export const getPicturesDirectories = () => {
  if (!config.pictures_directories) return [];
  return config.pictures_directories;
};

export const addPicturesDirectory = _ => {
  if (getPicturesDirectories().indexOf(_) !== -1) return;
  if (!config.pictures_directories) config.pictures_directories = [];
  config.pictures_directories.push(_);
};

export const removePicturesDirectory = _ => {
  const index = getPicturesDirectories().indexOf(_);
  if (index === -1) return;
  config.pictures_directories.splice(index, 1);
};
