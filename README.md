# interactive-silent-circle


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

If necessary, open ```Gruntfile.js``` and fix the file paths in the ```replace:local``` task.
(The ```replace``` task replaces text strings in files: it is used mostly to create builds with different file paths for assets and fonts).

```
    replace: {
      prod: {
        options: {
          patterns: [
            {
              match: /{{assets}}/g,
              replacement: pkg.config.cdn_url + 'assets-' + currentTime
            }
          ]
        },
        files: [
          {
            src: ['build/*.html', 'build/**/*.js', 'build/**/*.css'],
            dest: './'
          }
        ]
      },
      local: {
        options: {
          patterns: [
            {
              match: /{{assets}}/g,
              // replacement: 'assets'
              replacement: 'http://localhost:' + pkg.config.port + '/build/assets'
            },
            {
              match: /\/\/pasteup\.guim\.co\.uk\/fonts\/0\.1\.0/g,
              replacement: '/bower_components/guss-webfonts/webfonts'
              // replacement: '../../../bower_components/guss-webfonts/webfonts'
            }
          ]
        },
        files: [
          {
            src: ['build/*.html', 'build/**/*.js', 'build/**/*.css'],
            dest: './'
          }
        ]
      }
    },
```


## @TODO

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

