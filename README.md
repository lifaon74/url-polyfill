### Polyfill URL and URLSearchParams to match last WHATWG specifications

Compliant in most of the use cases but not at 100% (like unicode chars, punycodes, etc...)

Tested on IE 10+

#### Install
```
npm i url-polyfill --save
```

#### Currently supported

##### window.URL

Documentation: https://developer.mozilla.org/en-US/docs/Web/API/URL

Supported : 'hash', 'host', 'hostname', 'href', 'port', 'protocol', 'search', 'toString', 'pathname', 'origin', 'searchParams'

Example:

```js
const url = new URL('https://www.yahoo.com/?fr=yset_ie_syc_oracle&type=orcl_hpset#page0');
```
- hash: `"page0"`
- host: `"www.yahoo.com"`
- hostname: `"www.yahoo.com"`
- href: `"https://www.yahoo.com/?fr=yset_ie_syc_oracle&type=orcl_hpset#page0"`
- origin: `"https://www.yahoo.com"`
- pathname: `"/"`
- port: `""`
- protocol: `"https:"`
- search: `"?fr=yset_ie_syc_oracle&type=orcl_hpset"`
- searchParams: URLSearchParams (see next)

##### window.URLSearchParams

Documentation: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams

Supported : 'append', 'delete', 'get', 'getAll', 'has', 'set', 'forEach', 'keys', 'values', 'entries', 'toString', 'Symbol.iterator'

Example:

```js
const url = new URL('https://www.yahoo.com/?fr=yset_ie_syc_oracle&type=orcl_hpset#page0');
url.searchParams.append('page', 0);
console.log(url.toString()); // print: "https://www.yahoo.com/?fr=yset_ie_syc_oracle&type=orcl_hpset&page=0#page0"
```
