import { Driver, DriverBrowser } from './Driver';

export class Tester {


  public remoteUrl: string;

  constructor(remoteUrl: string) {
    this.remoteUrl = remoteUrl;
  }

  runForMany(browsers: DriverBrowser[], callback: (driver: Driver) => Promise<any>): Promise<void> {
    return Promise.all(
      browsers.map((browser: DriverBrowser) => this.runFor(browser, callback))
    ).then(() => {
    });
  }

  runFor(browser: DriverBrowser, callback: (driver: Driver) => Promise<any>): Promise<void> {
    const driver: Driver = Driver.create(browser, this.remoteUrl);
    return new Promise<void>((resolve: any) => {
      resolve(callback(driver));
    })
      .then(() => {
        return driver.quit();
      }, (error: any) => {
        return Promise.race([
          driver.quit(),
          new Promise((resolve: any) => setTimeout(resolve, 2000))
        ]).then(() => Promise.reject(error));
      });
  }

  test(testName: string, callback: () => Promise<void>): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      this.log(`Starting test '${testName}'`, 33);
      resolve(callback());
    })
      .then(() => {
        this.log(`test '${testName}' succeed`, 32);
      }, (error: any) => {
        this.log(`test '${testName}' failed`, 31);
        console.log(error);
        throw error;
      });
  }

  protected log(content: string, color?: number): void {
    console.log(this.colorString(content, color));
  }

  protected colorString(content: string, color: number = 0): string {
    return `\x1b[${color}m${content}\x1b[0m`;
  }
}
