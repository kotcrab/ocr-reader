# ocr-reader

OCR Reader is an app for organizing and reading scans of physical Japanese books and manga.
Each page is run through OCR (optical character recognition) which allows for selecting text
and use of pop-up dictionaries such as [yomichan](https://github.com/FooSoft/yomichan).
Reader also integrates with [JPDB](https://jpdb.io/) to automatically highlight unknown words.

There is also a text hooker page, it can also highlight unknown words thanks to the JPDB integration.

<img src="https://user-images.githubusercontent.com/4594081/224509444-e65b09c7-b1ce-428a-aa33-27e6f943d8f2.png" width="70%" height="70%" />

## Setup

### Requirements
- [Node.js](https://nodejs.org/en/) (v18 LTS recommended).
  - There is no need to install "Tools for Native Modules".
- [Google Cloud](https://cloud.google.com/) account is required to OCR images.
  - Must be either an account with billing activated or in a trial period.
  - 1000 images per month can be processed for free, then $1.50 for each 1000 images, see [details](https://cloud.google.com/vision/pricing).
  - Account is not required if you import OCR data created by someone else or if you just want to use the text hooker.
- Optionally, [JPDB](https://jpdb.io/) SRS account for highlighting unknown words.

### Google Cloud Preparation

In Google Cloud Console you will need to create a new project and enable Cloud Vision API. Then create service
account and download its JSON key file (**never share this file with anyone**).

1. Create a new project in the GCP console.
2. Go to the [Cloud Vision API](https://console.cloud.google.com/apis/library/vision.googleapis.com) and press "Enable".
3. Go to the [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) and press "Create service account".
   - Enter some name for the account and press "Create and continue" then press "Done".
   - Click on the newly created account and go to the "Keys" tab.
   - Press "Add key" then "Create new key".
   - JSON should be selected, press "Create".
   - JSON file will be downloaded automatically, you will need this file in the next steps.

### Installation

1. Download [release ZIP](https://github.com/kotcrab/ocr-reader/releases/latest/download/ocr-reader.zip), extract it.
2. If you have JSON key file for your Google Cloud account rename it to `gcp.json` and place it inside the `data` folder.
3. Run the application with `start.bat`.
   - On Linux or macOS execute `start.sh` from your terminal.

### Updating

To update to a different version:
1. Download new release ZIP, extract it.
2. Move `data` folder to the new version.
3. Start the application as usual.

### Advanced Configuration

Default locations of the data directory and Google Cloud key file can be changed in the `.env` file (it may be
hidden by default on Linux and macOS). If you do that don't forget to copy this file when updating to a different
version.

## Usage

After starting the app you will see its URL in the terminal window, usually that will
be http://localhost:3000. Open this address in your browser to access the app.

### JPDB Configuration

If you have a JPDB account and want to use it for unknown words highlighting:
1. In app go to the "Settings" page.
2. Using your browser devtools get the SID cookie value from the JPDB page.
3. Paste the SID value into the "JPDB SID" field and save the settings.

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
└───Title 3
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
- Adjust page zoom.
- Analyze the text and highlight unknown words with JPDB.
- Use the reading timer to track elapsed time and reading speed.
- Change minimum OCR confidence level.
- Change reading direction (right to left by default).
- Adjust the overlay:
  - Those options are meant for finding issues with the OCR, most of the time there's no need to use them.
  - Show overlaid text and highlight detected paragraphs.
  - Override font size and detected text direction.

### Text hooker

Text hooker page works with text extractors with support for WebSocket server, those are:
- [Textractor](https://github.com/Artikash/Textractor)
  - [TextractorSender](https://github.com/KamWithK/TextractorSender) extension required.
- [Agent](https://github.com/0xDC00/agent)
  - Server must be manually enabled in settings.

Assuming your text extractor is configured correctly you should automatically see that
WebSocket is connected after opening the text hooker page.

You can also just paste text directly into the page even when the WebSocket is disconnected.

If you have configured JPDB then click the `Analyze with JPDB (experimental)` checkbox to enable words highlighting.
The page tries to rate limit and won't send more than 1 request per second to JPDB.

### Maintenance

JPDB results are cached in `data/.jpdb-cache`, currently it's not automatically cleared. You can safely delete
it when app is not running.
