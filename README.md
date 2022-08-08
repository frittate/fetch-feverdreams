# fetch-feverdreams

## Goal
With this small NodeJS utility, you can download all images from your feverdreams.app account. To do so, go to your gallery on feverdreams.app and note down the gallery id from the URL.

## Install
1. Make sure you have Node > v16 installed
2. Clone or download the repository
3. Run `npm install`

## Usage
1. Run `npm run execute -- #galleryId #itemsPerPage #pageNo`
2. `galleryId` is your gallery id from above
3. `itemsPerPage` defaults to 50
4. `pageNo` defaults to 1, and should be incremented on every run (get page 1, 2, 3...)

## Downloaded items
1. All images are saved by creating date in the "downloaded" folder
2. The program tracks all downloads in the fetched_log.txt. If the id of the image is in there, it won't be loaded again. So if you want to reload an image, clear the fetched_log.txt file.