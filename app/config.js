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

export const addPicturesDirectory = _ => {
  if (getPicturesDirectories().indexOf(_) !== -1) return;
  if (!config.pictures_directories) config.pictures_directories = [];
  config.pictures_directories.push(_);
};

export const disableDirectory = _ => {
  let index;

  index = getAllPicturesDirectories().indexOf(_);
  if (index === -1) return;
  index = getDisabledPicturesDirectories().indexOf(_);
  if (index !== -1) return;

  config.disabled_pictures_directories.push(_);

  console.log(config);
};

export const enableDirectory = _ => {
  let index;

  index = getAllPicturesDirectories().indexOf(_);
  if (index === -1) return;
  index = getDisabledPicturesDirectories().indexOf(_);
  if (index === -1) return;

  config.disabled_pictures_directories.splice(index, 1);

  console.log(config);
};

export const getAllPicturesDirectories = () => {
  if (!config.pictures_directories) return [];
  return config.pictures_directories;
};
export const getDisabledPicturesDirectories = () => {
  if (!config.disabled_pictures_directories) return [];
  return config.disabled_pictures_directories;
};

export const getEnabledPicturesDirectories = () => {
  const all = getAllPicturesDirectories();
  const but = getDisabledPicturesDirectories();

  return all.filter(_ => but.indexOf(_) === -1);
};

export const removePicturesDirectory = _ => {
  let index;

  index = getPicturesDirectories().indexOf(_);
  if (index !== -1) {
    config.pictures_directories.splice(index, 1);
  }

  index = getDisabledPicturesDirectories().indexOf(_);
  if (index !== -1) {
    config.disabled_pictures_directories.splice(index, 1);
  }
};

export const toConfigFile = () => {
  yaml.sync(config_file_path, config);
  remote.app.relaunch();
  remote.app.exit();
};
