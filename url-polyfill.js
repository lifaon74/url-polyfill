
(function() {
  /**
   * Polyfill URLSearchParams
   *
   * Inspired from : https://github.com/WebReflection/url-search-params/blob/master/src/url-search-params.js
   */

  var checkIfURLSearchParamsIsSupported = function() {
    return ('URLSearchParams' in window);
  };

  var checkIfIteratorIsSupported = function() {
    try {
      return !!Symbol.iterator;
    } catch(error) {
      return false;
    }
  };


  var iteratorSupported = checkIfIteratorIsSupported();

  var createIterator = function(items) {
    var iterator = {
      next: function() {
        var value = items.shift();
        return { done: value === void 0, value: value };
      }
    };

    if(iteratorSupported) {
      iterator[Symbol.iterator] = function() {
        return iterator;
      };
    }

    return iterator;
  };


  var polyfillURLSearchParams= function() {

    var URLSearchParams = function(searchString) {
      Object.defineProperty(this, '_entries', { value: {} });

      if(typeof searchString === 'string') {
        searchString = searchString.replace(/^\?/, '');
        var attributes = searchString.split('&');
        var attribute;
        for(var i = 0; i < attributes.length; i++) {
          attribute = attributes[i].split('=');
          this.append(
            decodeURIComponent(attribute[0]),
            (attribute.length > 1) ? decodeURIComponent(attribute[1]) : ''
          );
        }
      } else if(searchString instanceof URLSearchParams) {
        var _this = this;
        searchString.forEach(function(value, name) {
          _this.append(value, name);
        });
      }
    };

    var proto = URLSearchParams.prototype;


    proto.append = function(name, value) {
      if(name in this._entries) {
        this._entries[name].push(value.toString());
      } else {
        this._entries[name] = [value.toString()];
      }
    };

    proto.delete = function(name) {
      delete this._entries[name];
    };

    proto.get = function(name) {
      return (name in this._entries) ? this._entries[name][0] : null;
    };

    proto.getAll = function(name) {
      return (name in this._entries) ? this._entries[name].slice(0) : [];
    };

    proto.has = function(name) {
      return (name in this._entries);
    };

    proto.set = function(name, value) {
      this._entries[name] = [value.toString()];
    };

    proto.forEach = function(callback, thisArg) {
      var entries;
      for(var name in this._entries) {
        if(this._entries.hasOwnProperty(name)) {
          entries = this._entries[name];
          for(var i = 0; i < entries.length; i++) {
            callback.call(thisArg, entries[i], name, this);
          }
        }
      }
    };

    proto.keys = function() {
      var items = [];
      this.forEach(function(value, name) { items.push(name); });
      return createIterator(items);
    };

    proto.values = function() {
      var items = [];
      this.forEach(function(value) { items.push(value); });
      return createIterator(items);
    };

    proto.entries = function() {
      var items = [];
      this.forEach(function(value, name) { items.push([value, name]); });
      return createIterator(items);
    };

    if(iteratorSupported) {
      proto[Symbol.iterator] = proto.entries;
    }

    proto.toString = function() {
      var searchString = '';
      this.forEach(function(value, name) {
        if(searchString.length > 0) searchString+= '&';
        searchString += encodeURIComponent(name) + '=' + encodeURIComponent(value);
      });
      return searchString;
    };

    window.URLSearchParams = URLSearchParams;
  };

  if(!checkIfURLSearchParamsIsSupported()) {
    polyfillURLSearchParams();
  }

  // console.log(new URLSearchParams('a=b&c=d'));

  // HTMLAnchorElement

})();

(function() {
  /**
   * Polyfill URL
   *
   * Inspired from : https://github.com/arv/DOM-URL-Polyfill/blob/master/src/url.js
   */

  var checkIfURLIsSupported = function() {
    try {
      var u = new URL('b', 'http://a');
      u.pathname = 'c%20d';
      return (u.href === 'http://a/c%20d');
    } catch(e) {
      return false;
    }
  };


  var polyfillURL = function() {
    var _URL = window.URL;

    var URL = function(url, base) {
      if(typeof url !== 'string') throw new TypeError('Failed to construct \'URL\': Invalid URL');

      var doc = document.implementation.createHTMLDocument('');
      if(base) {
        var baseElement = doc.createElement('base');
        baseElement.href = base;
        doc.head.appendChild(baseElement);
      }

      var anchorElement = doc.createElement('a');
      anchorElement.href = url;
      doc.body.appendChild(anchorElement);

      if(anchorElement.protocol === ':' || !/:/.test(anchorElement.href)) {
        throw new TypeError('Invalid URL');
      }

      Object.defineProperty(this, '_anchorElement', {
        value: anchorElement
      });
    };

    var proto = URL.prototype;

    var linkURLWithAnchorAttribute = function(attributeName) {
      Object.defineProperty(proto, attributeName, {
        get: function() {
          return this._anchorElement[attributeName];
        },
        set: function(value) {
          this._anchorElement[attributeName] = value;
        },
        enumerable: true
      });
    };

    ['hash', 'host', 'hostname', 'href', 'port', 'protocol', 'search']
    .forEach(function(attributeName) {
      linkURLWithAnchorAttribute(attributeName);
    });

    Object.defineProperties(proto, {

      'toString': {
        get: function() {
          var _this = this;
          return function() {
            return _this.href;
          };
        }
      },

      'pathname' : {
        get: function() {
          return this._anchorElement.pathname.replace(/(^\/?)/,'/');
        },
        set: function(value) {
          this._anchorElement.pathname = value;
        },
        enumerable: true
      },

      'origin': {
        get: function() {
          return this._anchorElement.protocol + '//' + this._anchorElement.hostname;
        },
        enumerable: true
      },

      'password': { // TODO
        get: function() {
          return '';
        },
        set: function(value) {
        },
        enumerable: true
      },

      'username': { // TODO
        get: function() {
          return '';
        },
        set: function(value) {
        },
        enumerable: true
      },

      'searchParams': {
        get: function() {
          var searchParams = new URLSearchParams(this.search);
          var _this = this;
          ['append', 'delete', 'set'].forEach(function(methodName) {
            var method = searchParams[methodName];
            searchParams[methodName] = function() {
              method.apply(searchParams, arguments);
              _this.search = searchParams.toString();
            };
          });
          return searchParams;
        },
        enumerable: true
      }
    });

    URL.createObjectURL = function(blob) {
      return _URL.createObjectURL.apply(_URL, arguments);
    };

    URL.revokeObjectURL = function(url) {
      return _URL.revokeObjectURL.apply(_URL, arguments);
    };

    window.URL = URL;

  };

  if(!checkIfURLIsSupported()) {
    polyfillURL();
  }

  if(!('origin' in window.location)) {
    try {
      Object.defineProperty(window.location, 'origin', {
        get: function() {
          return window.location.protocol + '//' + window.location.hostname;
        },
        enumerable: true
      });
    } catch(e) {
      setInterval(function() {
        window.location.origin = window.location.protocol + '//' + window.location.hostname;
      }, 100);
    }
  }


  // console.log(new URL('https://www.yahoo.com/?fr=yset_ie_syc_oracle&type=orcl_hpset'));

})();
