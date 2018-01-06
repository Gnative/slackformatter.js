# slackformatter.js
Formats messages from the Slack API into HTML

## Prerequisites

This library requires [js-emoji](https://github.com/iamcal/js-emoji).

It can be installed from the git repo, or using `npm install emoji-js` in your project.

## Installation

This library uses the UMD wrapper and can be loaded as a browser global as `SLACKFORMATTER`. The following examples will all use the browser global, switch the terminology to match your import flavour of choice.

## Usage

There are three things you should do to setup slackformatter.js:

1. Configure the options to your liking
2. Add a list of users from the Slack instance so the formatter can parse user IDs into user names
3. Add a list of custom emoji from the Slack instance

### `SLACKFORMATTER.setOptions(options)`

There are four options you can set for slackformatter.

1. `emojiPath` - path to the default emoji images used by emoji-js. _Default `/assets/img/emoji/`_
2. `channelClass` - class name for the channels. _Default `slack-channel`_
3. `userClass` - class name for the users. _Default `slack-user`_
4. `emojiClass` - class name for the emoji. _Default `slack-emoji`_
4. `preClass` - class name for the pre tag. _Default `is-pre`_

You can pass through an object with one or more of these options to update the settings of the plugin. Be sure to do this before anything else.

### `SLACKFORMATTER.addEmoji(emoji)`

Do a Slack API call to `emoji.list` and you'll get an array of objects back from the response (`response[0].emoji`).

Pass this array directly into `SLACKFORMATTER.addEmoji(emoji)`.

```js
doSlackAPICall('emoji.list').then(function(response) {
    SLACKFORMATTER.addEmoji(response[0].emoji);
});
```

_You may want to periodically update this is you have new custom emoji added all the time and you have a long running application._

### `SLACKFORMATTER.addUsers(users)`

Do a Slack API call to `users.list` and you'll get an array of objects back from the response (`response[0].members`).

Pass this array directly into `SLACKFORMATTER.addUsers(users)`.

```js
doSlackAPICall('users.list').then(function(response) {
    SLACKFORMATTER.addEmoji(response[0].members);
});
```

_You may want to periodically update this is you have new users added all the time and you have a long running application._

### `SLACKFORMATTER.get(text)`

Once you have the custom emoji and users added, now all you need to do is call `SLACKFORMATTER.get(text)` where the text is any Slack formatted text (e.g. `message.text` or `message.file.initial_comment.comment`).

## Output

### General formatting

#### Bold

`*bold text*` becomes `<strong>bold text</strong>`.

#### Italics

`_italics text_` becomes `<em>italics text</em>`.


#### Strikeout

`~striked text~` becomes `<del>striked text</del>`.

#### Code

``code`` becomes `<code>code</code>`.

#### Preformatted text

````preformatted```` becomes `<code class="is-pre">preformatted</code>`.

Where `is-pre` is the class name you've specified in the options. By default it is `is-pre`.

#### Links

`<https://github.com/dkeeghan/slackformatter>` becomes `<a href="https://github.com/dkeeghan/slackformatter">https://github.com/dkeeghan/slackformatter</a>`

#### Combinations

slackformatter also supports combinations, so `*_bold italics_*` becomes `<strong><em>bold italics</em></strong>`.

### Usernames

`<@USER_ID>` becomes `<span class="slack-user">USERNAME</span>`. 


Where `slack-user` is the class name you've specified in the options. By default it is `slack-user`.

You can then use CSS pseudo elements to add an @ symbol.

### Channels 

`<#CHANNEL_ID|CHANNEL_NAME>` becomes `<span class="slack-channel">CHANNEL_NAME</span>`.

Where `slack-channel` is the class name you've specified in the options. By default it is `slack-channel`.

You can then use a CSS psuedo element to add a # symbol.

### Default Emoji

`:smile:` becomes `<span class="slack-emoji" style="background-image:url(/path/to/emoji/1f604.png)" data-codepoints="1f604"></span>`

Where `/path/to/emoji` is where you've configured slackformatter to look for the images when you set the options. The default location is `/assets/img/emoji/`.

### Custom Emoji

`:party_parrot:` becomes `<span class="slack-emoji" style="background-image: url('https://emoji.slack-edge.com/ORG_ID/party_parrot/IMAGE_ID.gif')"></span>`

Where `slack-emoji` is the class name you've specified in the options. By default it is `slack-emoji`.

## Example

You can see an example of slackformatter running on [SlackViz](https://slackviz.com).