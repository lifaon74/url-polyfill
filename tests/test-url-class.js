"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var originalURL = window.URL;
var url_1 = require("../do-not-use/url");
var test = function () {
    var a = new originalURL('?fr=yset_ie_syc_oracle&type=orcl_hpset#page0', 'https://username:password@www.yahoo.com:80/path');
    var b = new url_1.URL('?fr=yset_ie_syc_oracle&type=orcl_hpset#page0', 'https://username:password@www.yahoo.com:80/path');
    // let b = new URL('https://username:password@www.yahoo.com:80/path?fr=yset_ie_syc_oracle&type=orcl_hpset#page0', '');
    window.a = a;
    window.b = b;
    // 'a+"*ç%&/()=?±“#Ç[]|{}≠b'
    for (var key in a) {
        var value = a[key];
        switch (typeof value) {
            case 'boolean':
            case 'number':
            case 'string':
                if (value !== b[key]) {
                    throw new Error('Values mismatch for key "' + key + '" : \n' + value + '\n' + b[key]);
                }
                break;
        }
    }
};
test();
