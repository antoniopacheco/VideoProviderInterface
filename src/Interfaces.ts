export interface Participant {
  videoTrack: any;
  audioTrack: any;
  screenVideoTrack: any;
  isLocal: boolean;
}

export abstract class VideoInterface {
  library: any;
  libraryName: string;
  listeners: any = {};
  videoDevices: any[] = [];
  audioDevices: any[] = [];

  constructor(props: any) {
    this.library = props.library;
    this.libraryName = props.libraryName;
    this.askPermissions();
  }
  abstract join(config: any): void;
  abstract leave(): void;
  abstract destroy(): void;
  abstract startScreenShare(): void;
  abstract stopScreenShare(): void;
  abstract participants(): Participant[];
  abstract meetingState(): string;
  abstract cycleCamera(): void;
  abstract setLocalVideo(mute: boolean): void;
  abstract setLocalAudio(mute: boolean): void;
  abstract selectCamera(deviceId: string): void;
  abstract selectAudio(deviceId: string): void;

  askPermissions = async () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(this.initDevices, (e) => {
        this.emit('error', 'permissions denied');
      });
  };

  initDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.videoDevices = devices.filter(
      (device) => device.kind === 'videoinput',
    );
    this.audioDevices = devices.filter(
      (device) => device.kind === 'audioinput',
    );
    this.emit('devices-changed', event);
  };

  startDeviceListener = () => {
    // Listen for changes to media devices and update the list accordingly
    navigator.mediaDevices.addEventListener('devicechange', (event) => {
      this.initDevices();
    });
  };

  getVideoDevices = () => {
    return this.videoDevices;
  };

  getAudioDevices = () => {
    return this.audioDevices;
  };

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

  off(name: string, callBack: any): void {
    if (this.listeners[name]) {
      this.listeners[name].findIndex((el: any) => el.callBack === callBack);
    }
  }

  once(name: string, callBack: any): any {
    return this.addListener(name, callBack, true);
  }

  emit(name: string, params: any): void {
    if (this.listeners[name]) {
      const indexesToDelete: any[] = [];
      this.listeners[name].forEach((action: any, index: number) => {
        action.callBack(params);
        if (action.oneTime) {
          indexesToDelete.push(index);
        }
      });
      indexesToDelete.forEach((i) => {
        this.listeners[name].splice(i, 1);
      });
    }
  }
  clearListeners(): void {
    this.listeners = {};
  }

  logger(
    eventList: string[],
    callBack: (libName: string, eventName: string, eventProps: any) => void,
  ) {
    eventList.forEach((event) => {
      this.on(event, (props: any) => {
        callBack(this.libraryName, event, props);
      });
    });
  }
}
