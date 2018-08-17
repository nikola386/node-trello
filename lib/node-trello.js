var request = require("request");
var querystring = require("querystring");
var OAuth = require("./trello-oauth");

// Creates a new Trello request wrapper.
// Syntax: new Trello(opts)
var Trello = module.exports = function (opts) {
  if(!opts) {
    throw new Error("Options object is required");
  }
  if (opts.useOAuth && (!opts.accessToken || !opts.accessTokenSecret || !opt.appApiSecret)) {
    throw new Error("Access token and secret are required");
  } else if (!opts.appApiKey || !opts.userToken) {
    throw new Error("Application key and user token are required");
  }

  this.opts = opts;
  this.appApiKey = opts.appApiKey;
  if(this.opts.useOAuth) {
    this.appApiSecret = opt.appApiSecret;
    this.accessToken = accessToken;
    this.accessTokenSecret = accessTokenSecret;
  } else {
    this.token = opts.userToken;
  }
  this.host = "https://api.trello.com";
};

// Make a GET request to Trello.
// Syntax: trello.get(uri, [query], callback)
Trello.prototype.get = function () {
  Array.prototype.unshift.call(arguments, "GET");
  return this.request.apply(this, arguments);
};

// Make a POST request to Trello.
// Syntax: trello.post(uri, [query], callback)
Trello.prototype.post = function () {
  Array.prototype.unshift.call(arguments, "POST");
  return this.request.apply(this, arguments);
};

// Make a PUT request to Trello.
// Syntax: trello.put(uri, [query], callback)
Trello.prototype.put = function () {
  Array.prototype.unshift.call(arguments, "PUT");
  return this.request.apply(this, arguments);
};

// Make a DELETE request to Trello.
// Syntax: trello.del(uri, [query], callback)
Trello.prototype.del = function () {
  Array.prototype.unshift.call(arguments, "DELETE");
  return this.request.apply(this, arguments);
};

// Make a request to Trello.
// Syntax: trello.request(method, uri, [query], callback)
Trello.prototype.request = function (method, uri, argsOrCallback, callback) {
  var args;

  if (arguments.length === 3) {
    callback = argsOrCallback;
    args = {};
  }
  else {
    args = argsOrCallback || {};
  }

  var url = this.host + (uri[0] === "/" ? "" : "/") + uri;

  if (method === "GET") {
    url += "?" + querystring.stringify(this.addAuthArgs(this.parseQuery(uri, args)));
  }

  var options = {
    url: url,
    method: method
  };

  if (args.attachment) {
    options.formData = {
      key: this.appApiKey,
      token: this.token
    };

    if (typeof args.attachment === "string" || args.attachment instanceof String) {
      options.formData.url = args.attachment;
    }
    else {
      options.formData.file = args.attachment;
    }
  }
  else {
    options.json = this.addAuthArgs(this.parseQuery(uri, args));
  }

  if(this.opts.useOAuth) {
    options.oauth = { 
      consumer_key: this.appApiKey,
      consumer_secret: this.appApiSecret,
      token: this.accessToken,
      token_secret: this.accessTokenSecret,
    };
  }

  request[method === 'DELETE' ? 'del' : method.toLowerCase()](options, function (err, response, body) {
    if (!err && response.statusCode >= 400) {
      err = new Error(body);
      err.statusCode = response.statusCode;
      err.responseBody = body;
      err.statusMessage = require('http').STATUS_CODES[response.statusCode];
    }

    callback(err, body);
  });
};

Trello.prototype.addAuthArgs = function (args) {
  if(this.opts.useOAuth) {
    return args;
  }

  args.key = this.appApiKey;

  if (this.token) {
    args.token = this.token;
  }

  return args;
};

Trello.prototype.parseQuery = function (uri, args) {
  if (uri.indexOf("?") !== -1) {
    var ref = querystring.parse(uri.split("?")[1]);

    for (var key in ref) {
      var value = ref[key];
      args[key] = value;
    }
  }

  return args;
};

Trello.OAuth = OAuth;
