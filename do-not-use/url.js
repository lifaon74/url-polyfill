"use strict";
/*
 inspired from
 https://raw.githubusercontent.com/github/url-polyfill/master/url.js
 and https://stackoverflow.com/questions/6168260/how-to-parse-a-url
*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var createIterator;
if (Symbol && Symbol.iterator && (typeof ([][Symbol.iterator]) === 'function')) {
    createIterator = function (items) {
        return items[Symbol.iterator]();
    };
}
else {
    createIterator = function (items) {
        return {
            next: function () {
                var value = items.shift();
                return { done: value === void 0, value: value };
            }
        };
    };
}
/**
 * Encodes a path segment.
 * RFC 3986 reserves !, ', (, ), and * and the implementation pipes the
 * output of encodeURIComponent to a hex encoding pass for these special
 * characters.
 */
function encodePathSegment(segment) {
    return encodeURIComponent(segment).replace(/[!'()*]/g, function (c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}
var URLSearchParams = /** @class */ (function () {
    function URLSearchParams(init) {
        var _this = this;
        this._entries = {};
        if (typeof init === 'string') {
            if (init !== '') {
                init = init.replace(/^\?/, '');
                var attributes = init.split('&');
                var attribute = void 0;
                for (var i = 0; i < attributes.length; i++) {
                    attribute = attributes[i].split('=');
                    this.append(decodeURIComponent(attribute[0]), (attribute.length > 1) ? decodeURIComponent(attribute[1]) : '');
                }
            }
        }
        else if (init instanceof URLSearchParams) {
            init.forEach(function (value, name) {
                _this.append(value, name);
            });
        }
    }
    URLSearchParams.prototype.append = function (name, value) {
        value = value.toString();
        if (name in this._entries) {
            this._entries[name].push(value);
        }
        else {
            this._entries[name] = [value];
        }
    };
    URLSearchParams.prototype.delete = function (name) {
        delete this._entries[name];
    };
    URLSearchParams.prototype.get = function (name) {
        return (name in this._entries) ? this._entries[name][0] : null;
    };
    URLSearchParams.prototype.getAll = function (name) {
        return (name in this._entries) ? this._entries[name].slice(0) : [];
    };
    URLSearchParams.prototype.has = function (name) {
        return (name in this._entries);
    };
    URLSearchParams.prototype.set = function (name, value) {
        this._entries[name] = [value.toString()];
    };
    URLSearchParams.prototype.forEach = function (callback) {
        var entries;
        for (var name_1 in this._entries) {
            if (this._entries.hasOwnProperty(name_1)) {
                entries = this._entries[name_1];
                for (var i = 0; i < entries.length; i++) {
                    callback.call(this, entries[i], name_1, this);
                }
            }
        }
    };
    URLSearchParams.prototype.keys = function () {
        var items = [];
        this.forEach(function (value, name) { items.push(name); });
        return createIterator(items);
    };
    URLSearchParams.prototype.values = function () {
        var items = [];
        this.forEach(function (value) { items.push(value); });
        return createIterator(items);
    };
    URLSearchParams.prototype.entries = function () {
        var items = [];
        this.forEach(function (value, name) { items.push([value, name]); });
        return createIterator(items);
    };
    URLSearchParams.prototype.toString = function () {
        var searchString = '';
        this.forEach(function (value, name) {
            if (searchString.length > 0)
                searchString += '&';
            searchString += encodeURIComponent(name) + '=' + encodeURIComponent(value);
        });
        return searchString;
    };
    return URLSearchParams;
}());
exports.URLSearchParams = URLSearchParams;
var URL = /** @class */ (function () {
    function URL(url, base) {
        var baseParts;
        try {
            baseParts = URL.parse(base);
        }
        catch (e) {
            throw new Error('Invalid base URL');
        }
        var urlParts = URL.parse(url);
        if (urlParts.protocol) {
            this._parts = __assign({}, urlParts);
        }
        else {
            this._parts = {
                protocol: baseParts.protocol,
                username: baseParts.username,
                password: baseParts.password,
                hostname: baseParts.hostname,
                port: baseParts.port,
                path: urlParts.path || baseParts.path,
                query: urlParts.query || baseParts.query,
                hash: urlParts.hash,
            };
        }
        // console.log(URL.parse(base), URL.parse(url), this._parts);
    }
    URL.init = function () {
        this.URLRegExp = new RegExp('^' + this.patterns.protocol + '?' + this.patterns.authority + '?' + this.patterns.path + this.patterns.query + '?' + this.patterns.hash + '?');
        this.AuthorityRegExp = new RegExp('^' + this.patterns.authentication + '?' + this.patterns.hostname + this.patterns.port + '?$');
    };
    URL.parse = function (url) {
        var urlMatch = this.URLRegExp.exec(url);
        if (urlMatch !== null) {
            var authorityMatch = urlMatch[2] ? this.AuthorityRegExp.exec(urlMatch[2]) : [null, null, null, null, null];
            if (authorityMatch !== null) {
                return {
                    protocol: urlMatch[1] || '',
                    username: authorityMatch[1] || '',
                    password: authorityMatch[2] || '',
                    hostname: authorityMatch[3] || '',
                    port: authorityMatch[4] || '',
                    path: urlMatch[3] || '',
                    query: urlMatch[4] || '',
                    hash: urlMatch[5] || '',
                };
            }
        }
        throw new Error('Invalid URL');
    };
    Object.defineProperty(URL.prototype, "hash", {
        get: function () {
            return this._parts.hash;
        },
        set: function (value) {
            value = value.toString();
            if (value.length === 0) {
                this._parts.hash = '';
            }
            else {
                if (value.charAt(0) !== '#')
                    value = '#' + value;
                this._parts.hash = encodeURIComponent(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "host", {
        get: function () {
            return this.hostname + (this.port ? (':' + this.port) : '');
        },
        set: function (value) {
            value = value.toString();
            var url = new URL('http://' + value);
            this._parts.hostname = url.hostname;
            this._parts.port = url.port;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "hostname", {
        get: function () {
            return this._parts.hostname;
        },
        set: function (value) {
            value = value.toString();
            this._parts.hostname = encodeURIComponent(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "href", {
        get: function () {
            var authentication = (this.username || this.password) ? (this.username + (this.password ? (':' + this.password) : '') + '@') : '';
            return this.protocol + '//' + authentication + this.host + this.pathname + this.search + this.hash;
        },
        set: function (value) {
            value = value.toString();
            var url = new URL(value);
            this._parts = __assign({}, url._parts);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "origin", {
        get: function () {
            return this.protocol + '//' + this.host;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "password", {
        get: function () {
            return this._parts.password;
        },
        set: function (value) {
            value = value.toString();
            this._parts.password = encodeURIComponent(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "pathname", {
        get: function () {
            return this._parts.path ? this._parts.path : '/';
        },
        set: function (value) {
            var chunks = value.toString().split('/').map(encodePathSegment);
            if (chunks[0]) {
                // ensure joined string starts with slash.
                chunks.unshift('');
            }
            this._parts.path = chunks.join('/');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "port", {
        get: function () {
            return this._parts.port;
        },
        set: function (value) {
            var port = parseInt(value);
            if (isNaN(port)) {
                this._parts.port = '0';
            }
            else {
                this._parts.port = Math.max(0, port % (Math.pow(2, 16))).toString();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "protocol", {
        get: function () {
            return this._parts.protocol + ':';
        },
        set: function (value) {
            value = value.toString();
            if (value.length !== 0) {
                if (value.charAt(value.length - 1) === ':') {
                    value = value.slice(0, -1);
                }
                this._parts.protocol = encodeURIComponent(value);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "search", {
        get: function () {
            return this._parts.query;
        },
        set: function (value) {
            value = value.toString();
            if (value.charAt(0) !== '?')
                value = '?' + value;
            this._parts.query = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "username", {
        get: function () {
            return this._parts.username;
        },
        set: function (value) {
            value = value.toString();
            this._parts.username = encodeURIComponent(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(URL.prototype, "searchParams", {
        get: function () {
            var _this = this;
            var searchParams = new URLSearchParams(this.search);
            ['append', 'delete', 'set'].forEach(function (methodName) {
                var method = searchParams[methodName];
                searchParams[methodName] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    method.apply(searchParams, args);
                    _this.search = searchParams.toString();
                };
            });
            return searchParams;
        },
        enumerable: true,
        configurable: true
    });
    URL.prototype.toString = function () {
        return this.href;
    };
    // createObjectURL(object: any, options?: ObjectURLOptions): string;
    // revokeObjectURL(url: string): void;
    URL.patterns = {
        protocol: '(?:([^:/?#]+):)',
        authority: '(?://([^/?#]*))',
        path: '([^?#]*)',
        query: '(\\?[^#]*)',
        hash: '(#.*)',
        authentication: '(?:([^:]*)(?::([^@]*))?@)',
        hostname: '([^:]+)',
        port: '(?::(\\d+))',
    };
    return URL;
}());
exports.URL = URL;
URL.init();
