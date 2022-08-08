import axios, { Axios } from 'axios';
import { promises as fs } from 'fs';
import fse, { PathEntry, WriteStream } from 'fs-extra';
import path from 'path';
import { imageSettings } from './interfaces/ImageSettings.interface';

// VARS
const cmdArgs = process.argv.slice(2);
const userId: string = cmdArgs[0] || '391948300451971083';
const itemsPerPage: number = parseInt(cmdArgs[1] || '50');
const pages: number = parseInt(cmdArgs[2] || '1');
const baseUrl: string = 'https://api.feverdreams.app/userfeed'

// FUNCTIONS
async function getImagesFromProfile(): Promise<imageSettings[]> {
  const url: string = `${baseUrl}/${userId}/${itemsPerPage}/${pages}`

  try {
    const { data } = await axios.get(url)

    if (data.length) {
      return data
    } else {
      return []
    }
  } catch (error) {
    throw error
  }
}

async function getLoggedIds(): Promise<string[]> {
  const logFile: ArrayBuffer = await fs.readFile('fetched_log.txt');
  return Buffer.from(logFile).toString().replace(/\r\n/g, '\n').split('\n')
}

function downloadImageRequest(imageUUID: string) {
  const url: string = `https://images.feverdreams.app/jpg/${imageUUID}.jpg`

  return axios.get(url, {
    responseType: 'stream'
  });
}

function writeConfigFile(imageSetting: imageSettings, directory: string) {
  const filePath: string = path.resolve(directory, `${imageSetting.uuid}.json`);
  const fileContent: string = JSON.stringify(imageSetting);

  fse.writeFileSync(filePath, fileContent)
  return
}

function writeLogEntry(uuid: string) {
  const logStream: WriteStream = fse.createWriteStream('fetched_log.txt', { flags: 'a' });
  logStream.write(uuid + "\n");
  logStream.end();

  console.log('read and created:', uuid);

  return
}

// CODE
// fetch all imagesSettings
const allImages: imageSettings[] = await getImagesFromProfile()

if (!allImages.length) {
  process.exit(1)
}

// read file with the old Ids
// for each imageSetting, check if the ID is already downloaded
let alreadyFetchedIds: string[] = await getLoggedIds()
const imagesToDownload: Array<Promise<any>> = []

allImages.forEach(async (imageSetting: imageSettings) => {
  if (alreadyFetchedIds.includes(imageSetting.uuid)) {
    console.log('already exists:',  imageSetting.uuid);
  } else {
    // download the image proper
    try {
      const { data } = await downloadImageRequest(imageSetting.uuid)

      // get the date of the file and make a folder
      const timeFinished = imageSetting.time_completed.$date
      const folderNameByDate = timeFinished.split('T')[0]
      const directory = `./downloaded/${folderNameByDate}`
      await fse.ensureDir(directory)
  
      // write to a file
      const filePath: string = path.resolve(directory, `${imageSetting.uuid}.jpg`)
      const stream: WriteStream = fse.createWriteStream(filePath)
  
      const writer = data.pipe(stream)
  
      writer.on('finish', () => {
        writeConfigFile(imageSetting, directory)
        writeLogEntry(imageSetting.uuid)
      });
    } catch (error) {
      process.exit(1)
    }
  }
})
