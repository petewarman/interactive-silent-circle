# Silent Circle - The Power of Privacy


## Setup

```bash
> npm install
> bower install
```
See ```package.json``` and ```bower.json```


## Build + watch + local server

```bash
> grunt
```

A local server should run on ```http://localhost:8080```
See ```Gruntfile.js```


## Check paths

If necessary, fix the root and assets paths in ```index.html``` and ```app/main.js``` files.
At the moment the paths for local and remote versions are:

```
  // ROOT
  remote = "//labs.theguardian.com/2015/aug/silent-circle-video/";
  local = "";
  isWeb = typeof window.guardian !== "undefined";
  root = isWeb ? remote : local;
  
  // ASSETS
  assets = root + 'assets/';
```

## @TODO

- ### IMPORTANT: bug in IE9 when the application is deployed on S3 and seen in the [*preview*](http://preview.gutools.co.uk/global/ng-interactive/2015/aug/14/55c320dce4b0bd0a9cfb5bbe) page. The json file cannot be downloaded from a different domain on IE9. SUGGESTED FIX: correct path or directly import JSON in the build with require JSON plugin. It works on: http://labs.theguardian.com/2015/aug/silent-circle-video/

- Update the file ```/src/data/coming-soon.json``` with "Coming soon" videos data

- Update the YouTube playlist ID in ```/src/js/app/main.js```
```var playlistId = 'playlist ID here';```


- Update the Google Engine App key to get access to the YouTube Data API in ```/src/js/app/main.js``` (needed for subtitles and CC)
```var youtubeDataApiKey = 'YouTube Data API Key here';```
See: ```https://developers.google.com/youtube/registering_an_application```


- Update text for Twitter and Facebook share icons in ```/src/js/app/views/mainVideo.js``` (method ```shareVideo```)

- Add the thanks.html page url in Formstack.
See: ```https://support.formstack.com/customer/portal/articles/1930012-submit-actions``` (section "Redirect to an External URL")


- Configure S3 in ```Gruntfile.js```


- Google Analytics (???)

