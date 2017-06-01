const assert = require('assert'),
  test = require('selenium-webdriver/testing'),
  webdriver = require('selenium-webdriver');


Promise.sequence = (promiseFactories) => {
  let promise = Promise.resolve();
  promiseFactories.forEach((promiseFactory) => {
    promise = promise.then(() => {
      promiseFactory();
    });
  });
  return promise;
};

Promise.parallel = (promiseFactories) => {
  let promises = [];
  promiseFactories.forEach(promiseFactory => {
    promises.push(promiseFactory());
  });
  return Promise.all(promises);
};

class Tester {
  static get CHROME () { return 'chrome' };
  static get FIREFOX () { return 'firefox' };
  static get OPERA () { return 'opera' };
  static get IE () { return 'ie' };
  static get EDGE () { return 'edge' };


  constructor(remoteUrl) {
    this.remoteUrl = remoteUrl;
  }

  testWith(browsers, callback) {
    let drivers = browsers.map((browser) => this.getBrowserDriver(browser));
    let promiseFactories = [];
    for(let i = 0; i < drivers.length; i++) {
      promiseFactories.push(() => {
        return this.testWithDriver(drivers[i], callback);
      });
    }
    return Promise.parallel(promiseFactories);
  }

  testWithDriver(driver, callback) {
    return new Promise((resolve, reject) => {
      callback(driver, resolve);
    });
  }

  getBrowserDriver(browserName) {
    let capabilities = null;

    switch(browserName) {
      case Tester.CHROME:
        capabilities = webdriver.Capabilities.chrome();
        break;
      case Tester.IE:
        capabilities = webdriver.Capabilities.ie();
        break;
      case Tester.FIREFOX:
        capabilities = webdriver.Capabilities.firefox();
        break;
      case Tester.OPERA:
        capabilities = webdriver.Capabilities.opera();
        break;
      case Tester.EDGE:
        capabilities = webdriver.Capabilities.edge();
        break;
      default:
        throw new Error('Can\'t find browswer name ' + browserName);
      // return null;
    }

    return new webdriver.Builder()
      .usingServer(this.remoteUrl)
      .withCapabilities(capabilities)
      .build();
  }

  navigate(driver, path) {
    return driver.executeScript('return window.router.navigate(' + JSON.stringify(path) + ');');
  }

  executeScript(driver, script) {
    return this.executeAsyncScript(driver, `resolve(
      (function() {
        ${script}
      })()
    );`);
  }

  executeAsyncScript(driver, script) {
    return driver.executeAsyncScript(`
     var __done = arguments[arguments.length - 1];
     var resolve = function(data) {
      __done({ success : true, data: data });
     };
     var reject = function(error) {
      __done({
        success : false,
        error: {
          name: error.name,
          message: (error.message || error.description),
          stack: error.stack
        }
      });
     };
     
     try {
      ${script}
     } catch(error) {
      reject(error);
     }
    `).then((data) => {
      if(data.success) {
        return data.data;
      } else {
        throw new Error(data.error.name + ' : ' + data.error.message + '\n' + data.error.stack + '\n\n');
      }
    });
  }

  untilIsNotVisible(element) {
    return () => {
      return element.isDisplayed().then(() => false).catch(() => true);
    };
  }

  sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, ms);
    });
  }
}

const config = require('./config.json');
const tester = new Tester(config.testServer);


test.describe('URL polyfill', function() {
  this.timeout(30000);

  tester.testWith([
    Tester.EDGE,
    Tester.CHROME,
    // Tester.FIREFOX,
    // Tester.OPERA,
    Tester.IE
  ], (driver, done) => {
    driver.manage().timeouts().setScriptTimeout(15000);


    test.before(() => {
      driver.manage().timeouts().pageLoadTimeout(1000);
       driver.navigate().to(config.testHost);
      return tester.sleep(2000);
    });

    // test.it('Load', () => {
    //   return tester.executeAsyncScript(driver, `
    //     if(document.body) {
    //       resolve();
    //     } else {
    //       window.addEventListener('load', resolve, false);
    //     }
    //   `);
    // });

    test.it('Test URL', () => {
      return tester.executeScript(driver, `
        var url = new URL('https://www.yahoo.com:80/?fr=yset_ie_syc_oracle&type=orcl_hpset#page0');

        if(url.hash !== '#page0') throw new Error('Invalid hash : ' + url.hash);
        if(url.host !== 'www.yahoo.com:80') throw new Error('Invalid host : ' + url.host);
        if(url.hostname !== 'www.yahoo.com') throw new Error('Invalid hostname : ' + url.hostname);
        if(url.href !== 'https://www.yahoo.com:80/?fr=yset_ie_syc_oracle&type=orcl_hpset#page0') throw new Error('Invalid href : ' + url.href);
        if(url.origin !== 'https://www.yahoo.com:80') throw new Error('Invalid origin : ' + url.origin);
        if(url.pathname !== '/') throw new Error('Invalid pathname : ' + url.pathname);
        if(url.port !== '80') throw new Error('Invalid port : ' + url.port);
        if(url.protocol !== 'https:') throw new Error('Invalid protocol : ' + url.protocol);
        if(url.search !== '?fr=yset_ie_syc_oracle&type=orcl_hpset') throw new Error('Invalid search : ' + url.search);

        url.searchParams.append('page', 1);
        if(url.search !== '?fr=yset_ie_syc_oracle&type=orcl_hpset&page=1') throw new Error('Invalid search (append page 1) : ' + url.search);

        url.searchParams.delete('type')
        if(url.search !== '?fr=yset_ie_syc_oracle&page=1') throw new Error('Invalid search (delete type) : ' + url.search);

        return url;
      `)/*.then((data) => {
        console.log(data);
      })*/;
    });

    test.it('Test URL with base', () => {
      return tester.executeScript(driver, `
        var url = new URL('test', 'http://www.example.com');
        
        if(url.host !== 'www.example.com') throw new Error('Invalid host : ' + url.host);
        if(url.hostname !== 'www.example.com') throw new Error('Invalid hostname : ' + url.hostname);
        if(url.href !== 'http://www.example.com/test') throw new Error('Invalid href : ' + url.href);
        if(url.pathname !== '/test') throw new Error('Invalid pathname : ' + url.pathname);
        if(url.protocol !== 'http:') throw new Error('Invalid protocol : ' + url.protocol);
        if(url.search !== '') throw new Error('Invalid search : ' + url.search);
        
        return url;
      `);
    });

    test.it('Ensure url.href does\'nt finish with ? if url.search is empty', () => {
      return tester.executeScript(driver, `
        var url = new URL('https://www.example.com/');
        url.searchParams.delete('foo');
        if(url.toString() !== 'https://www.example.com/') throw new Error('Invalid url : ' + url.toString());
      `);
    });


    test.after(() => {
      driver.quit();
      done();
    });
  });
});


