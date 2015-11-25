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
