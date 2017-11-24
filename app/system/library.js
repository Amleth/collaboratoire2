import 'babel-polyfill';
import Chance from 'chance';
import crypto from 'crypto';
import electron, { nativeImage, remote } from 'electron';
import { EventEmitter } from 'events';
import exif from 'fast-exif';
import fs from 'fs-extra';
import ImageFile from 'image-file';
import imagesize from 'image-size';
import klawSync from 'klaw-sync';
import klaw from 'klaw';
import path from 'path';

var chance = new Chance();
export const authorized_pictures_extensions = ['.jpg', '.jpeg', '.png'];
export const ee = new EventEmitter();
export const EVENT_DIRECTORY_ANALYSIS_COMPLETE = 'EVENT_DIRECTORY_ANALYSIS_COMPLETE';
export const EVENT_COMPLETE = 'COMPLETE';
export const EVENT_DIRECTORIES_ANALYSES_COMPLETE = 'EVENT_DIRECTORIES_ANALYSES_COMPLETE';
export const EVENT_PICTURE_METADATA_ERROR = 'EVENT_PICTURE_ANALYSIS_ERROR';
export const EVENT_PICTURE_METADATA_COMPLETE = 'EVENT_PICTURE_METADATA_COMPLETE';
export const EVENT_CACHE_BUILDING_COMPLETE = 'EVENT_CACHE_BUILDING_COMPLETE';
export const EVENT_THUMBNAIL_CREATION_COMPLETE = 'EVENT_THUMBNAIL_CREATION_COMPLETE';
export const EVENT_THUMBNAILS_CREATION_COMPLETE = 'EVENT_THUMBNAILS_CREATION_COMPLETE';

//
// LIBRARY
//

export const initPicturesLibrary = async (cache_file, thumbnails_dir, pictures_directories) => {
  //
  // Pictures cache initialization
  //

  let pictures_cache = {};

  if (fs.existsSync(cache_file)) {
    pictures_cache = JSON.parse(fs.readFileSync(cache_file));
  }

  // We want to clean the cache from files that no longer exist on user's hard
  // drive. Consequently, we keep track of files SHA1: each encountered file
  // will leave this registry.
  const unusedSha1 = {};
  for (const sha1 in pictures_cache) {
    unusedSha1[sha1] = null;
  }

  //
  // Helper: file metadata collector
  //

  const makePictureObjectFromFile = async file => {
    // We always need to compute the picture file SHA1, because it's the way we
    // retrieve files metadata from the cache.
    const sha1 = await getSHA1(file.path);

    // Is the picture file in the cache or not?
    if (!pictures_cache[sha1]) {
      // We compute all the "technical" metadata.
      let exif = await readExif(file.path);
      let dpix =
        exif && exif.hasOwnProperty('image') && exif.image.hasOwnProperty('XResolution')
          ? exif.image.XResolution
          : null;
      let dpiy =
        exif && exif.hasOwnProperty('image') && exif.image.hasOwnProperty('YResolution')
          ? exif.image.YResolution
          : null;
      if (!dpix && !dpiy) dpix = dpiy = getJPEGPPI(file.path);
      const dimensions = await sizeOf(file.path);
      const { width, height } = dimensions;

      pictures_cache[sha1] = {
        files: [file.path], // an array of paths, because maybe other files will have the same SHA1, and thus the same metadata
        file: file.path, // For now, we alse store the first encountered file for the current SHA1
        file_basename: path.basename(file.path),
        id: chance.guid(),
        width,
        height,
        sha1,
        dpix,
        dpiy
      };
    } else {
      if (pictures_cache[sha1] && pictures_cache[sha1].files && pictures_cache[sha1].files.indexOf(file.path) < 0)
        pictures_cache[sha1].files.push(file.path);
    }

    // This is a used file SHA1
    delete unusedSha1[sha1];
  };

  //
  // User pictures files examination
  //

  const files = await collectPictureFilesInDirectories(pictures_directories);
  for (const f of files) {
    try {
      await makePictureObjectFromFile(f, pictures_cache);
      ee.emit(EVENT_PICTURE_METADATA_COMPLETE);
    } catch (e) {
      ee.emit(EVENT_PICTURE_METADATA_ERROR, f.path, e);
    }
  }

  //
  // New cache creation
  //

  for (const sha1 in unusedSha1) {
    delete pictures_cache[sha1];
  }
  fs.writeFileSync(cache_file, JSON.stringify(pictures_cache));
  const pictures_cache_array = Object.values(pictures_cache);
  ee.emit(EVENT_CACHE_BUILDING_COMPLETE, pictures_cache_array);

  //
  // Thumbnails generation
  //

  await sleep(666);

  for (const i of pictures_cache_array) {
    const thumbnail_path = path.join(thumbnails_dir, `${i.id}.jpg`);

    const exists = await fs.pathExists(thumbnail_path);
    if (exists) continue;

    const image = nativeImage.createFromPath(i.file);
    const resizedImage = image.resize({
      height: 256
    });
    fs.writeFileSync(thumbnail_path, resizedImage.toJPEG(100));
    ee.emit(EVENT_THUMBNAIL_CREATION_COMPLETE, thumbnail_path);
  }

  pictures_cache_array.forEach((e, i, a) => {
    a[i].thumbnail = path.join(thumbnails_dir, `${e.id}.jpg`);
  });

  ee.emit(EVENT_THUMBNAILS_CREATION_COMPLETE);

  //
  // New cache
  //

  setTimeout(() => {
    ee.emit(EVENT_COMPLETE, pictures_cache_array);
  }, 1111);
};

//
// HELPERS
//

export const readExif = async file => exif.read(file);

const sizeOf = _ => {
  return new Promise((fulfill, reject) => {
    imagesize(_, (error, dimensions) => {
      if (error) reject(error);
      else fulfill(dimensions);
    });
  });
};

const collectPictureFilesInDirectories = directories => {
  return new Promise((resolve, reject) => {
    let files = [];

    const start = new Date().getTime();
    directories.map(d => {
      klaw(d, {
        filter: _ =>
          !(fs.statSync(_).isDirectory() && ['.dropbox.cache', 'node_modules', '.git'].includes(path.basename(_)))
      })
        .on('data', _ => {
          let event;
          const stats = fs.statSync(_.path);
          if (stats.isDirectory()) {
          } else {
            if (authorized_pictures_extensions.includes(path.extname(_.path).toLowerCase())) {
              files.push(_);
            }
          }
          if (event) {
          }
        })
        .on('end', () => {
          console.log(`${new Date().getTime() - start}ms`);
          ee.emit(EVENT_DIRECTORIES_ANALYSES_COMPLETE, files.length);
          resolve(files);
        });
    });
  });
};

const getSHA1 = file =>
  new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject(err);
      else
        resolve(
          crypto
            .createHash('sha1')
            .update(data)
            .digest('hex')
        );
    });
  });

const getJPEGPPI = file => {
  const ext = path.extname(file).toLowerCase();
  if (ext !== '.jpg' && ext !== '.jpeg') return null;

  const image = new ImageFile(new Uint8Array(fs.readFileSync(file)).buffer);

  return image.ppi;
};

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const sleep = async ms => {
  await timeout(ms);
};
