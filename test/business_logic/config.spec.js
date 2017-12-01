import { addPicturesDirectory, get, getPicturesDirectories, removePicturesDirectory, set } from '../../app/config';

const init = () => set({ pictures_directories: ['a'] });

test('Set then set', () => {
  init();
  expect(get()).toEqual({ pictures_directories: ['a'] });
});

test('Add pictures directory', () => {
  init();
  addPicturesDirectory('b');
  expect(getPicturesDirectories()).toEqual(['a', 'b']);
});

test('Remove pictures directory', () => {
  init();
  addPicturesDirectory('b');
  removePicturesDirectory('a');
  expect(getPicturesDirectories()).toEqual(['b']);
});
