
export class Async {
  static $delay(timeout: number): Promise<void> {
    return new Promise<void>((resolve: any) => {
      setTimeout(resolve, timeout);
    });
  }

  static $yield(): Promise<void> {
    return new Promise<void>((resolve: any) => {
      // process.nextTick(resolve);
      // setTimeout(resolve, 0);
      setImmediate(resolve);
    });
  }

  static async $await(callback: () => boolean, timeout: number = 0): Promise<void> {
    const startTime: number = Date.now();
    while(!callback()) {
      await this.$yield();
      if((timeout > 0) && (Date.now() - startTime > timeout)) throw new Error('Timeout reached');
    }
  }
}
