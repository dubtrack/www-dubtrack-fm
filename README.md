WWW-DUBTRACK  :]
====

Documentation coming soon, for now you can follow this instructions to run it locally. Submit all PRs against the `staging` branch

##Requirements

 - [nodemon](https://github.com/remy/nodemon)
 - [grunt-cli](https://github.com/gruntjs/grunt-cli)
 - [compass](http://compass-style.org/)

```
npm install
```

##js and sass

```
grunt dev
```

##Node server
```
nodemon web.js
```

##DNS
add the folowing entry on your `/etc/hosts` files
```
127.0.0.1 dev-dubtrack.fm
```
go to [dev-dubtrack.fm:3005](http://dev-dubtrack.fm:3005)

##Logging in
**do not use your personal accounts, use test accounts**, once you log-in the site will redirect you to `http://staging-www.dubtrack.fm`, simply change the url to your local (http://dev-dubtrack.fm:3005), and you should be logged in :)
