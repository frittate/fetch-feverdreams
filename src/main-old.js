import { promises as fs } from 'fs';
import fse from 'fs-extra';
import axios from 'axios';
import path from 'path';

async function downloadImage(imageUUID, filepath) {
  const url = `https://images.feverdreams.app/jpg/${imageUUID}.jpg`

  const response = await axios.get(url, {
    responseType: 'stream'
  });

  return new Promise((resolve, reject) => {
    response.data
      .pipe(fse.createWriteStream(filepath))
      .on('error', reject)
      .once('close', () => resolve(filepath));
  });
}

async function writeToLogFile(uuid) {
  const logStream = fse.createWriteStream('fetched_log.txt', { flags: 'a' });
  logStream.write(uuid + "\n");
  logStream.end();
  return
}

async function writeSettingsFile(data, directory) {
  const fileId = data.uuid

  const fileContent = JSON.stringify(data)

  try {
    fse.writeFileSync(path.join(directory, `/${fileId}.json`), fileContent);
    await writeToLogFile(data.uuid)
    return Promise.resolve(true);
  } catch (error) {
    return Promise.reject('error')
  }
}

async function fetchAllImagesOnProfile() {
  const userId = '391948300451971083'
  const itemsPerPage = 50
  const pages = 1
  const url = `https://api.feverdreams.app/userfeed/${userId}/${itemsPerPage}/${pages}`
  const { data } = await axios.get(url)

  if (data.length) {
    return data
  } else {
    return
  }
}

async function downloadAndWrite() {
  const allImages = await fetchAllImagesOnProfile()
  const uuids = allImages.map(item => item.uuid)

  const imageUUID = allImages[0].uuid
  const timeFinished = allImages[0].time_completed.$date
  const folderNameByDate = timeFinished.split('T')[0]

  const directory = `./downloaded/${folderNameByDate}`
  await fse.ensureDir(directory)

  const imageFilePathAndName = path.join(directory, `/${imageUUID}.jpg`)

  const logFile = await fs.readFile('fetched_log.txt');
  let alreadyFetchedIds = []
  alreadyFetchedIds = Buffer.from(logFile).toString().replace(/\r\n/g, '\n').split('\n')

  if (!alreadyFetchedIds.includes(imageUUID)) {
    console.log('will load:', imageUUID);

    await downloadImage(imageUUID, imageFilePathAndName)
    await writeSettingsFile(allImages[0], directory)
  } else {
    console.log('already loaded:', imageUUID);
  }
}


// await downloadAndWrite()


/* 
getItems()
for each item in getItems, check id
if (id is in file) return
if (id is not in file) download image
if (image dl is finished) write config file AND write id to log
if (image dl fails) write config file to fail folder

*/

async function getImagesFromProfile() {
  return 
}

const allImages = getImagesFromProfile()

console.log('thing');