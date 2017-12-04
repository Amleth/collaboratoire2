import fs from 'fs-extra';
import path from 'path';

export const getMetadata = _ => {
  const baseNameWithoutExtension = path.basename(_, path.extname(_));
  const jsonFilePath = path.join(path.dirname(_), baseNameWithoutExtension + '.json');
  if (fs.existsSync(jsonFilePath)) {
    const metadata = fs.readFileSync(jsonFilePath, 'utf8');
    return JSON.parse(metadata);
  }
  return null;
};

export const METADATA_TITLES = {
  basisofrecord: 'Basis of Record',
  catalognumber: 'Catalog Number',
  collectioncode: 'Collection Code',
  collectionid: 'Collection ID',
  collectionname: 'Collection Name',
  dwcaid: 'DWCA ID',
  family: 'Family',
  genus: 'Genus',
  institutioncode: 'Institution Code',
  institutionid: 'Institution ID',
  institutionname: 'Institution Name',
  modified: 'Modified',
  scientificname: 'Scientific Name',
  specificepithet: 'Specific Epithet',
  determinations: 'Determinations'
};

export const METADATA_DETERMINATIONS_TITLES = {
  created: 'Created',
  family: 'Family',
  genus: 'Genus',
  higherclassification: 'Higher Classification',
  identificationverificationstatus: 'Identification Verification Status',
  modified: 'Modified',
  scientificname: 'Scientific Name',
  scientificnameauthorship: 'Scientific Name Authorship',
  specificepithet: 'Specific Epithet',
  taxonid: 'Taxon ID'
};
