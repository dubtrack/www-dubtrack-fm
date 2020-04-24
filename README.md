#Important - Please Read

Today we have to share some sad news with you and explain how this will impact everything moving forward.

Recently we were made aware that the previous owner of Dubtrack has taken control of our domain (dubtrack.fm) and has locked us out completely. For over a year we have been battling to gain access to all of Dubtrack's accounts to ensure we can continue to operate normally. Today, however, marks the last day we invest any more time and effort into this.

What is the future of Dubtrack?

We remain committed to reviving Dubtrack, but after this recent discovery, we are left with no choice but to rebrand the service. Since 2012, Dubtrack has served millions of unique people who share the same passion, and has seen hundreds of events hosted on the platform. The name also carries infamies and complications that we would like to disconnect from, so we hope you can understand.

What will happen to the domain?

In all honesty, we have no idea. The previous owner is free to do whatever they want with it. From this point onwards, we cannot control any content on that domain and we would consider it unsafe to input any data on there.

Is my data that Dubtrack stores safe?

Yes. We have always been very careful with who we allow to have access to your data. For the avoidance of doubt, there has not been a breach of your data and it is still only within the hands of the admin team.

Social channels

In a similar fashion to the domain, we lost access to our main Facebook page. Any future posts made on there are not from us. We do, however, have full access to our other [Facebook page](https://www.facebook.com/Dubtrack/) which before was used for our old YouTube channel. We plan to repurpose this and use it as our main Facebook page - make sure you go ahead and like it. We are in full control of our official [Twitter account](https://twitter.com/dubtrack_fm) so there's no change there - Make sure to follow us if you’re not already. It is with those pages and our [Discord server](https://discord.gg/r7UEdpF) combined that make up our official social channels. We will post the most up-to-date information to all these channels, so ensure you’re following and be weary of information you see outside of them.

The last few years have been difficult for us, and this situation doesn't help either. The next chapter for us will not be easy either, but we are still very determined to come back bigger and better. We realise it's been over 5 months since we closed, and it pains us as much as it does you that we're still not back especially during the current pandemic, however we can assure you we are doing what we can to return.

This situation will set us back further due to the changes we have to make on our end, though it goes without saying that we really appreciate your patience and understanding throughout this.

# Important

This repo is no longer updated and is not what the current Dubtrack is using. At the moment we are currently rebuilding Dubtrack from the ground up (See the [announcement](https://www.facebook.com/dubtrackfm/posts/1259743990810775)) which will be a massive improvement over the current website.

Please continue to offer your suggestions and improvements as we do read though them all.

Make sure to follow us on all our social channels for updates about the new Dubtrack:

[Discord](https://discord.gg/r7UEdpF)

[Twitter](https://twitter.com/dubtrack_fm)

[Facebook](https://www.facebook.com/dubtrack/)

[Reddit](https://www.reddit.com/r/dubtrackapp/)


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
