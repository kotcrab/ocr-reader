#### Version 1.4.1
- Added page loading progress bar to make the app feel more responsive. It can be disabled in settings.

#### Version 1.4
- Added page view mode where page can be freely panned and zoomed.
- Added two-page display mode.
- Font size and text orientation options are now hidden by default in the reader menu. Hold Alt key to show them.
- JPDB deck ID input was replaced by proper select box with deck names.
- Book description text now preserves white space formatting.
- Optimized home screen performance when searching through many books.
- Fixed text hooker not able to analyze longer texts.

#### Version 1.3.3
- Fixed app settings validation.

#### Version 1.3.2
- JPDB popup placement can now be configured for horizontal and vertical text.
- Reorganized settings page.

#### Version 1.3.1
- Fixed bug where missing frequency rank is not handled in the popup.

#### Version 1.3
- JPDB integration was rewritten to use the new JPDB API.
  - If you are using this integration you will need to go the settings and enter your JPDB API key.
    SID cookie is no longer used.
  - Added JPDB vocabulary popup when hovering over the word.
    - Popup can be used to add words to the mining, blacklist or never forget decks.
    - Added setting for the mining deck ID.
  - You can now customise which card types to highlight, which should have popup. Default colors can be changed.
  - Confidence selector now also works on the analysis result.
  - The `data/.jpdb-cache` directory is no longer used and should be deleted. Cache is now in memory.
- Text selection color override is now only applied to the overlay text.

#### Version 1.2.2

- Text hooker page should be now compatible with more tools.

#### Version 1.2.1

- Improved sizing of overlaid vertical text.

#### Version 1.2

- Improved home screen now supports editing books description, notes and source. You can also pin and archive books.
- Minimum OCR confidence can now be changed on the fly in the reader settings.
- Fixed issue where hotkeys stopped working after doing dictionary lookup.
- Fixed bug where resetting the timer did not reset page read mark.
- Fixed bug where current page mark could exceed total page count if images were removed from the book.

#### Version 1.1

- Improved overlay now supports automatic font sizing and better text direction detection.
- Added reading timer tracking elapsed time and reading speed.
- Text hooker WebSocket URL can now be changed in settings.
- Fixed bug where text selection is not cleared when switching pages.

#### Version 1.0

- Initial release.
