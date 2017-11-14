import 'babel-polyfill';
import Chance from 'chance';
import crypto from 'crypto';
import electron, { nativeImage, remote } from 'electron';
import exif from 'fast-exif';
import fs from 'fs-extra';
import ImageFile from 'image-file';
import imagesize from 'image-size';
import klawSync from 'klaw-sync';
import path from 'path';

var chance = new Chance();
const sizeOf = _ => {
  return new Promise((fulfill, reject) => {
    imagesize(_, (error, dimensions) => {
      if (error) reject(error);
      else fulfill(dimensions);
    });
  });
};
export const authorized_pictures_extensions = ['.jpg', '.jpeg', '.png'];
export const readExif = async file => exif.read(file);

//
// LIBRARY
//

/*
// TODO
On collecte toutes les images du disque.
Pour chacune d'entre elles, on regarde si elle est dans le cache ou pas.
Si oui, on ne fait rien.
Si non, on construit son entrée dans le cache (metadonnées + miniature).
*/
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
  // File metadata collector helper
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
        id: chance.guid(),
        width,
        height,
        sha1,
        dpix,
        dpiy
      };
    } else {
      pictures_cache[sha1].files.push(file.path);
    }

    // This is a used file SHA1
    delete unusedSha1[sha1];
  };

  //
  // User pictures files examination
  //

  const files = collectPictureFilesInDirectories(pictures_directories);
  for (const f of files) {
    await makePictureObjectFromFile(f, pictures_cache);
  }

  //
  // New cache creation
  //

  for (const sha1 in unusedSha1) {
    delete pictures_cache[sha1];
  }
  fs.writeFileSync(cache_file, JSON.stringify(pictures_cache));
  const pictures_cache_array = Object.values(pictures_cache);

  //
  // Thumbnails generation
  //

  for (const i of pictures_cache_array) {
    const thumbnail_path = path.join(thumbnails_dir, `${i.id}.jpg`);

    if (fs.existsSync(thumbnail_path)) continue;

    const image = nativeImage.createFromPath(i.file);
    const resizedImage = image.resize({ height: 256 });
    fs.writeFileSync(thumbnail_path, resizedImage.toJPEG(100));
  }

  pictures_cache_array.forEach((e, i, a) => {
    a[i].thumbnail = path.join(thumbnails_dir, `${e.id}.jpg`);
  });

  //
  // New cache
  //

  return pictures_cache_array;
};

const collectPictureFilesInDirectories = directories => {
  let files = [];
  const filterFn = item => authorized_pictures_extensions.includes(path.extname(item.path).toLowerCase());
  directories.map(d => (files = [...files, ...klawSync(d, { filter: filterFn })]));

  return files;
};

//
// PICTURE
//

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
