import * as $webdriver from 'selenium-webdriver';

export type DriverBrowser = 'chrome' | 'firefox' | 'opera' | 'ie' | 'edge';



export class Driver {
  static get CHROME(): DriverBrowser {
    return 'chrome';
  };

  static get FIREFOX(): DriverBrowser {
    return 'firefox';
  };

  static get OPERA(): DriverBrowser {
    return 'opera';
  };

  static get IE(): DriverBrowser {
    return 'ie';
  };

  static get EDGE(): DriverBrowser {
    return 'edge';
  };

  static create(browserName: DriverBrowser, remoteUrl?: string) {
    let capabilities: any = null;

    switch (browserName) {
      case this.CHROME:
        capabilities = $webdriver.Capabilities.chrome();
        break;
      case this.IE:
        capabilities = $webdriver.Capabilities.ie();
        break;
      case this.FIREFOX:
        capabilities = $webdriver.Capabilities.firefox();
        break;
      case this.OPERA:
        capabilities = $webdriver.Capabilities.opera();
        break;
      case this.EDGE:
        capabilities = $webdriver.Capabilities.edge();
        break;
      default:
        throw new Error(`Can't find browswer name ${browserName}`);
    }

    let builder: any = new $webdriver.Builder();

    if (remoteUrl !== void 0) {
      builder = builder.usingServer(remoteUrl);
    }

    return new Driver(
      builder
        .withCapabilities(capabilities)
        .build()
    );
  }

  public driver: any;

  constructor(driver: any) {
    this.driver = driver;
  }

  /**
   * Executes an async script in the browser. Provides 2 function:
   *  - resolve
   *  - reject
   * @param {string} script
   * @return {Promise<void>}
   */
  executeAsyncScript(script: string): Promise<void> {
    // return this.driver.executeAsyncScript('arguments[arguments.length - 1]()');
    return this.driver.executeAsyncScript(`
       var __done = arguments[arguments.length - 1];
       
       var resolve = function(data) {
         if(__done) __done({ success : true, data: data });
         __done = null;
       };
       
       var reject = function(error) {
         if(error instanceof Error) {
          var type = error.constructor.name || (/^\\s*function\\s+([^\\(\\s]*)\\s*/).exec(error.constructor.toString())[1]
          error = { type: type, name: error.name || '', message: error.message || '', stack: error.stack || '' };
         }
         if(__done) __done({ success : false, _error: error });
         __done = null;
       };
       
       try {
         ${script}
       } catch(error) {
         reject(error);
       }
     
    `).then((data: any) => {
      if (data.success) {
        return data.data;
      } else {
        let error: any = data._error;

        if(typeof error === 'object') {
          const type: any = (error.type in global) ? global[error.type] : Error;
          const _error: any = new type(error.message || '');
          if(error.name && (error.name !== _error.name)) _error.name = error.name;
          // if(error.stack) _error.stack = error.stack;
          _error.stack = error.stack || `${error.name}: ${error.message}\n\tempty stack`;
          error = _error;
        }

        throw error;
      }
    });
  }

  /**
   * Executes a script in the browser.
   * Can return a value with 'return'
   * @param {string} script
   * @return {Promise<void>}
   */
  executeScript(script: string): Promise<void> {
    return this.executeAsyncScript(`resolve(
      (function() {
        ${script}
      })()
    );`);
  }


  navigate(url: string): Promise<void> {
    return this.driver.navigate().to(url);
  }


  ngNavigate(path: string): Promise<void> {
    return this.driver.executeScript(`return window.router.navigate(${JSON.stringify(path)});`);
  }

  quit(): Promise<void> {
    return this.driver.quit();
  }

}