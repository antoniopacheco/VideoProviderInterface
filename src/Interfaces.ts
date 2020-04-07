export interface Participant {
  videoTrack: MediaStreamTrack;
  audioTrack: MediaStreamTrack;
  isLocal: boolean;
}

export abstract class VideoInterface {
  library: any;
  listeners: any = {};
  constructor(props: any) {
    this.library = props.library;
  }
  abstract join(url: string): void;
  abstract leave(): void;
  abstract destroy(): void;
  abstract startScreenShare(): void;
  abstract stopScreenShare(): void;
  abstract participants(): Participant[];

  addListener(name: string, callBack: any, oneTime: boolean): any {
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push({
      oneTime,
      callBack,
    });

    return {
      remove: () => {
        this.listeners[name].splice(this.listeners[name].length - 1, 1);
      },
    };
  }

  on(name: string, callBack: any): any {
    return this.addListener(name, callBack, false);
  }

  once(name: string, callBack: any): any {
    return this.addListener(name, callBack, true);
  }

  emit(name: string): void {
    if (this.listeners[name]) {
      let indexesToDelete: any[] = [];
      this.listeners[name].forEach((action: any, index: number) => {
        action.callBack();
        if (action.oneTime) {
          indexesToDelete.push(index);
        }
      });
      indexesToDelete.forEach((i) => {
        this.listeners[name].splice(i, 1);
      });
    }
  }
}
