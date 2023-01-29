# ocr-reader

OCR Reader is an app for organizing and reading scans of printed books in Japanese.
Each page is run through OCR (optical character recognition) which allows for selecting text
and use of pop-up dictionaries such as [yomichan](https://github.com/FooSoft/yomichan).
Reader also integrates with [JPDB](https://jpdb.io/) to automatically highlight unknown words.

Experimental text hooker page is also available, it can also highlight unknown words thanks to the
JPDB integration.

## Setup

### Requirements
- [Node.js](https://nodejs.org/en/) (v18 LTS recommended).
- [Google Cloud](https://cloud.google.com/) account is required to OCR images.
  - Must be either an account with billing activated or in a trial period.
  - 1000 images per month can be processed for free, then $1.50 for each 1000 images, see [details](https://cloud.google.com/vision/pricing).
  - Account is not required if you import OCR data created by someone else or if you just want to use the text hooker.
- Optionally, [JPDB](https://jpdb.io/) SRS account for highlighting unknown words.

### Google Cloud Preparation

In Google Cloud Console create new project and enable Cloud Vision API. Then create service
account with access to your project and download its JSON key file (**never share this file with anyone**).
This part of the setup is mostly covered by this [guide](https://cloud.google.com/vision/docs/detect-labels-image-client-libraries#before-you-begin),
section `Before you begin`, skip last step with setting environment variable.

### Installation

1. Download ZIP of this project [here](https://github.com/kotcrab/ocr-reader/archive/refs/heads/master.zip), extract it.
2. If you have JSON key file for your Google Cloud account rename it to `gcp.json` and place it inside `data` folder.
   - This file may be placed anywhere but in that case you will need to change the path in the `.env` file.
3. If you have JPDB account and want to use it for unknown words highlighting:
   - Using your browser devtools get the SID cookie value from the JPDB page.
   - Edit `.env` file using any text editor. This file may be hidden by default on Linux and macOS.
   - Paste the SID value after `JPDB_SID=` (it should look like this `JPDB_SID=1234...`) and save the file.
4. Run `build.bat`.
   - On Linux or macOS run `npm install && npm run build` from your terminal.
   - Wait until build finishes, this might take a while.

Now any time you want to use the app just run `start.bat` (or run `npm run start` from terminal).

### Updating

To update to a different version:
  - Download new ZIP, extract it.
  - Copy `data` folder and `.env` file to the new version.
    - `.env` file may be hidden by default on Linux and macOS.
  - Run build (same as during the installation, see above).

## Usage

After starting the app you will see its URL in the terminal window, usually that will
be http://localhost:3000. Open this address in your browser to access the app.

### Reader

To add books to the reader, place images inside the `data` folder following this structure:

```
data
├───Author 1
│   ├───Title 1
│   │       001.jpg
│   │       002.jpg
│   │       ....jpg
│   └───Title 2
│           001.jpg
│           002.jpg
│           ....jpg
└───Title 1
        001.jpg
        002.jpg
        ....jpg
```

- Images can be scans, photos, screenshots etc. If it's readable OCR should handle it.
- Names can be anything you want. Image names will be used for page sorting.
- Only images are supported (JPG, PNG).
- PDFs are not supported, but you can convert PDFs to images using other tools (e.g. ImageMagick, pdfimages).

**Warning**: images with EXIF rotation in metadata won't be handled correctly.
This is mainly a concern when using photos.
Make sure all EXIF rotation data is removed and images are rotated correctly before continuing.
[XnView MP](https://www.xnview.com/en/) works well for removing EXIF and fixing rotation.

Press `Rescan books` on the home page after changing books.

Press `OCR pending...` to start OCR, after it's done you will be able to press `Read` button.

You can also use the menu to download OCRed text. This is useful for creating JPDB decks
(for this you should download text with line breaks removed).

In reader mode, you can:
- Use your favorite pop-up dictionary as-if you were reading normal text.
- Adjust font size of the overlaid text.
  - Overlaid text just need to roughly match actual image text, don't worry about getting it perfect.
- Adjust page zoom.
- Change text direction from vertical to horizontal (if auto-detection fails), change reading direction.
- Analyze the text and highlight unknown words with JPDB.

### Text hooker

Text hooker page works with text extractors with support for WebSocket server, those are:
- [Textractor](https://github.com/Artikash/Textractor)
  - [TextractorSender](https://github.com/KamWithK/TextractorSender) extension required.
- [Agent](https://github.com/0xDC00/agent)
  - Server must be manually enabled in settings.

Assuming your text extractor is configured correctly you should automatically see that
WebSocket is connected after opening the text hooker page.

You can also just paste text directly into the page even when the WebSocket is disconnected.

If you have configured JPDB then click the `Analyze with JPDB (experimental)` checkbox to enable word highlighting.
The page tries to rate limit and won't send more than 1 request per second to JPDB.

### Maintenance

JPDB results are cached in `data/.jpdb-cache`, currently it's not automatically cleared. You can safely delete
it when app is not running.
