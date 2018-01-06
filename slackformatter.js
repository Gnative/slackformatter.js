/*! https://github.com/dkeeghan/slackformatter | BSD 3-Clause (http://opensource.org/licenses/BSD-3-Clause) */
(function (root, factory) {
    // UMD wrapper - Works with node, AMD and browser globals.
    // Using the returnExports pattern as a guide:
    // https://github.com/umdjs/umd/blob/master/templates/returnExports.js

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.SLACKFORMATTER = factory();
    }
}(this, function () {

    var _users = {},
		_customEmoji = {},
		_emoji = new EmojiConvertor(),
		_getUser,
		_getCustomEmoji,
		_parseSlackTag,
		_getHTML,
		_validateFormatMatch,
		_formats = {},
		_options,
		addUsers,
		addEmoji,
		get,
		setOptions;

	_options = {
		emojiPath: '/assets/img/emoji/',
		channelClass: 'slack-channel',
		userClass: 'slack-user',
		emojiClass: 'slack-emoji',
		preClass: 'is-pre'
	}

	_getUser = function(id) {
		if (typeof (_users[id]) === 'object') {
			return _users[id];
		}

		return false;
	};

	_getCustomEmoji = function(id) {
		if (typeof (_customEmoji[id]) === 'string') {
			return _customEmoji[id];
		}

		return false;
	};

	_parseSlackTag = function(tagContents, skipIdentifier) {
		if (skipIdentifier) {
			tagContents = tagContents.substr(1, tagContents.length - 1);
		}

		return tagContents.split('|');
	};

	_getHTML = function(tag, content, attrs) {
		if (typeof (attrs) !== 'object') {
			attrs = {};
		}

		var tagAndAttrs = tag;

		for (var attr in attrs) {
			if (attrs.hasOwnProperty(attr)) {
				tagAndAttrs = tagAndAttrs + ' ' + attr + '="' + attrs[attr] + '"';
			}
		}

		return '<' + tagAndAttrs + '>' + content + '</' + tag + '>';
	};

	_validateFormatMatch = function(match, html) {
		var checkWhitespace = function(val) {
			return /^\s?$/.test(val);
		};

		var mIndex = match.index,
			mInput = match.input,
			isValidBefore = (mIndex === 0),
			isValidAfter = (mIndex === mInput.length - match[0].length);

		if (isValidBefore === false) {
			isValidBefore = checkWhitespace(mInput.substr(mIndex - 1, 1));
		}

		if (isValidAfter === false) {
			isValidAfter = checkWhitespace(mInput.substr(mIndex + match[0].length, 1));
		}

		//if (isValidBefore && isValidAfter) {
			return html;
		//}

		return false;
	}

	_formats.slackTags = {
		regex: /<(.*?)>/g,
		formatter: function(match) {
			var type = match[1].substring(0, 1),
				value = match[1];

			if (type === '@' || type === '!') {
				// users
				var userTag = _parseSlackTag(value, true);

				if (userTag.length === 2) {
					return _getHTML('span', userTag[1], { class: _options.userClass });
				}

				var user = _getUser(userTag[0]);
				user = (user) ? user.name : userTag[0];

				return _getHTML('span', user, { class: _options.userClass });
			} else if (type === '#') {
				// channels
				var channelTag = _parseSlackTag(value, true),
					channel = (channelTag.length === 1) ? channelTag[0] : channelTag[1];

				return _getHTML('span', channel, { class: _options.channelClass });
			} else {
				// links
				var linkTag = _parseSlackTag(value),
					linkTagText = (linkTag.length === 1) ? linkTag[0] : linkTag[1];

				return _getHTML('a', linkTagText, { href: linkTag });
			}
		}
	};

	_formats.emoji = {
		regex: /:([a-zA-Z0-9-_+]+):/g,
		formatter: function(match) {
			var name = match[1],
				customEmoji = _getCustomEmoji(name);

			// TODO Support more than just custom emoji
			if (customEmoji !== false) {
				return _getHTML('span', '', {
					class: _options.emojiClass,
					style: 'background-image: url(\'' + customEmoji + '\')'
				});
			}

			_emoji.img_sets.apple.path = _options.emojiPath;
			_emoji.replace_mode = 'img';
			_emoji.allow_native = false;
			_emoji.supports_css = true;
			_emoji.use_sheet = false;

			var img = _emoji.replace_colons(':' + name + ':');
			img = img.replace(/class="(.*?)"/, 'class="' + _options.emojiClass + '"');

			return img;
		}
	};

	_formats.bold = {
		regex: /\*([^\*]*?)\*/g,
		formatter: function(match) {
			return _validateFormatMatch(match, _getHTML('strong', match[1]));
		}
	};

	_formats.italics = {
		regex: /_([^_]*?)_/g,
		formatter: function(match) {
			return _validateFormatMatch(match, _getHTML('em', match[1]));
		}
	};

	_formats.strike = {
		regex: /~([^~]*?)~/g,
		formatter: function(match) {
			return _validateFormatMatch(match, _getHTML('del', match[1]));
		}
	};

	_formats.preformatted = {
		regex: /```([^```]*?)```/g,
		formatter: function(match) {
			return _validateFormatMatch(match, _getHTML('code', match[1].replace(/^\n|\n$/g, ''), { class: _options.preClass }));
		}
	};

	_formats.code = {
		regex: /`([^`]*?)`/g,
		formatter: function(match) {
			return _validateFormatMatch(match, _getHTML('code', match[1]));
		}
	};

	_formats.quote = {
		regex: /^(?:>|&gt;)\s*(.+)/g,
		formatter: function(match) {
			return _validateFormatMatch(match, _getHTML('q', match[1]));
		}
	};

	_formats.newline = {
		regex: /(?:\r\n|\r|\n)/g,
		formatter: function() {
			return '<br/>';
		}
	};

	addUsers = function(users) {
		if (typeof(users) === 'object') {
			_users = users;
			return true;
		} else if(typeof(users) === 'array') {
			for (var i = 0, len = users.length; i < len; i += 1) {
				_users[user.id] = users[i];
			}

			return true;
		}

		return false;
	};

	addEmoji = function(emoji) {
		if (typeof(emoji) === 'object') {
			_customEmoji = emoji;
			return true;
		}

		return false;
	};

	get = function(text) {
		if (typeof (text) !== 'string') {
			throw new Error('Text supplied to SLACKFORMATTER.get() must be a string.');
		}

		for (var key in _formats) {
			if (_formats.hasOwnProperty(key)) {
				var format = _formats[key],
					originalText = text,
					matched;

				// replace each of the instances of this format (could have 0 or many instances)
				while ((matched = format.regex.exec(originalText)) !== null) {
					var replaceWith = format.formatter(matched);

					if (replaceWith) {
						text = text.replace(matched[0], replaceWith);
					}
				}
			}
		}

		// remove empty HTML tags if any
		text = text.replace(/<(\w*)\s*[^\/>]*>\s*<\/\1>/g, '');

		return text;
	}

	setOptions = function(options) {
		for (var key in options) {
			if (_options.hasOwnProperty(key)) {
				_options[key] = options[key];
			}
		}
	};

	return {
		addUsers: addUsers,
		addEmoji: addEmoji,
		get: get,
		setOptions: setOptions
	};
}));
