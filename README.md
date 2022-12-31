# ocr-reader

OCR Reader is an app for organizing and reading scans of printed books in Japanese.
Each page is run through OCR (optical character recognition) which allows for selecting text
and use of pop-up dictionaries such as [yomichan](https://github.com/FooSoft/yomichan).
Reader also integrates with [JPDB](https://jpdb.io/) to automatically highlight unknown words.

Experimental text hooker page is also available, it can also highlight unknown words thanks to the
JPDB integration.

Please note that this app is in activate development. There are bugs, missing features and there
might be breaking changes.

## Installation

### Requirements
- [Node.js](https://nodejs.org/en/) (v18 LTS recommended).
- [Google Cloud](https://cloud.google.com/) account is required to use OCR features.
  - Must be either account with billing activated or a free trial account.
  - 1000 images per month can be processed for free, then $1.50 for each 1000 images, see [details](https://cloud.google.com/vision/pricing).
- Optionally, [JPDB](https://jpdb.io/) SRS account for highlighting unknown words.

### Google Cloud Setup

In Google Cloud Console create new project and enable Cloud Vision API. Then create service
account with access to your project and download its JSON key file (**never share this file with anyone**).
This part of the setup is mostly covered by this [guide](https://cloud.google.com/vision/docs/detect-labels-image-client-libraries#before-you-begin),
section `Before you begin`, step 1-5.

### Setup

1. Download ZIP of this project [here](https://github.com/kotcrab/ocr-reader/archive/refs/heads/master.zip), extract it.
2. If you have JSON key file for your Google Cloud account rename it to `gcp.json` and place it inside `data` folder.
3. Rename `.env.local.sample` to `.env.local`.
   - This file may be hidden by default on Linux and macOS.
4. If you have JPDB account and want to use it for unknown words highlighting:
   - Using your browser devtools get the SID cookie value from the JPDB page.
   - Open `.env.local` using any text editor.
   - Paste the SID value after `JPDB_SID=` (it should look like this `JPDB_SID=1234...`).
   - Save file.
5. Run `build.bat`.
   - On Linux or macOS run `npm install && npm run build` from your terminal.
   - Wait until build finishes, this might take a while.

Now any time you want to use the app just run `start.bat` (or run `npm run start` from terminal).

### Updating

To update to a different version:
  - Download new ZIP, extract it.
  - Copy `data` folder and `.env.local` to the new version.
  - Run build (same as during the installation, see above).

## Usage

After starting the app you will see its url in the terminal window, usually that will
be http://localhost:3000. Open this address in your browser to access the app.

### Reader

#### Adding books

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

- Images can be scans, photos, screenshots. If it's readable OCR should handle it.
- Names can be anything you want. Image names will be used for page sorting.
- Only images are supported (JPG, PNG), PDFs are not supported.

**Warning**: images with EXIF rotation in metadata won't be handled correctly.
Make sure all EXIF rotation data is removed and images are rotated correctly before continuing.
[XnView MP](https://www.xnview.com/en/) works well for removing EXIF and fixing rotation.

Press `Rescan books` on the home page after changing books.

Press `OCR pending...` to start OCR, after it's done you will be able to press `Read` button.

You can also use the menu to download OCRed text. This is useful for creating JPDB deck
(for this you should download text with line breaks removed).

In reader mode, you can:
- Use your favorite pop-up dictionary as-if you were reading normal text.
- Switch the text direction from vertical to horizontal (it won't be autodetected).
- Adjust font size of the overlaid text.
  - Overlaid text just need to roughly match actual image text, don't worry about getting it perfect.
- Adjust page zoom.
- Analyze the text and highlight unknown words with JPDB.

Reader settings are unfortunately not yet saved between sessions.

### Text hooker

Text hooker page works with text extractors with support for WebSocket server, those are:
- [Textractor](https://github.com/Artikash/Textractor)
  - [TextractorSender](https://github.com/KamWithK/TextractorSender) extension required.
- [Agent](https://github.com/0xDC00/agent)
  - Server must be manually enabled in settings.

Assuming your text extractor is configured correctly you should automatically see that
WebSocket is connected after opening text hooker page.

If you have configured JPDB then check the `Analyze with JPDB (experimental)` to enable word highlighting.
The page tries to rate limit and won't send more than 1 request per second to JPDB.

### Maintenance

JPDB results are cached in `data/.jpdb-cache`, currently it's not automatically cleared. You can safely delete
it when app is running.
