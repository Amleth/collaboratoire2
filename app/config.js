import configYaml from 'config-yaml';
import { remote } from 'electron';
import path from 'path';
import yaml from 'write-yaml';

let config;
let config_file_path;

export const get = () => config;
export const set = _ => (config = _);

export const setConfigFilePath = _ => (config_file_path = _);

export const fromConfigFile = () => {
  try {
    config = configYaml(config_file_path);
  } catch (e) {
    config = {};
  }
};

export const toConfigFile = () => {
  yaml.sync(config_file_path, config);
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
