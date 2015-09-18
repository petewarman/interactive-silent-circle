# Silent Circle - The Power of Privacy


## Setup

```bash
> npm install
> bower install
```
See ```package.json``` and ```bower.json```


## Update JSON content
The JSON data file contains:
- "copy":
  - Share buttons copy
  - Url to the Guardian page
  - Copy for the Coming Soon videos before the date of publication: example "Coming on [date]"
- "videosExtraData":
  - Coming Soon videos Title + Description
  - Coming Soon image files (the root for these images is ```/src/imgs/videos/```)
  - Coming Soon publication date
  - YouTube video SHORT description


## Update hardcoded links to "Take the test"
The section linking to the "Take the test" page must be updated with the right link: you will find them in the template file at ```/src/js/app/templates/appTemplate.html```


## Build + watch + local server

```bash
> grunt
```

A local server should run on ```http://localhost:8080```
See ```Gruntfile.js```


## Check paths

If necessary, open ```Gruntfile.js``` and fix the file paths in the ```replace``` task.


## @TODO

- Update the file ```/src/data/data.json``` with "Coming soon" videos data


- Update text for Twitter and Facebook share icons in ```/src/data/data.json```


