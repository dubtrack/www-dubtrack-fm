# Important

This repo is no longer updated and is not what the current Dubtrack is using. At the moment we are currently rebuilding Dubtrack from the ground up (See the [announcement](https://www.facebook.com/dubtrackfm/posts/1259743990810775)) which will be a massive improvement over the current website.

Please continue to offer your suggestions and improvements as we do read though them all.

Make sure to follow us on all our social channels for updates about the new Dubtrack:

[Discord](https://discord.gg/r7UEdpF)

[Twitter](https://twitter.com/dubtrack_fm)

[Facebook](https://www.facebook.com/dubtrackfm/)

[Reddit](https://www.reddit.com/r/dubtrack/)


WWW-DUBTRACK  :]
=================

Documentation coming soon, for now you can follow these instructions to run it locally. Submit all PRs against the `staging` branch

## Requirements

 - [nodemon](https://github.com/remy/nodemon)
 - [grunt-cli](https://github.com/gruntjs/grunt-cli)


```bash
npm install --global nodemon grunt-cli; npm install
```
## JS and Stylus

**Note:**  After building this task will show `Waiting...`, This just means it's watching for file changes.

```bash
grunt dev
```

## Node Server

**Note:** This command will startup the web server and then watch for file changes.

```bash
nodemon web.js
```

## DNS

Add the folowing entry to your `/etc/hosts` files (Or `C:\Windows\System32\drivers\etc\HOSTS`)
```
127.0.0.1 dev-dubtrack.fm
```
go to [dev-dubtrack.fm:3005](http://dev-dubtrack.fm:3005)

## Logging in
**Do not use your personal accounts, use test accounts**, once you log-in the site will redirect you to `http://staging-www.dubtrack.fm`, simply change the url to your local (http://dev-dubtrack.fm:3005), and you should be logged in :)
