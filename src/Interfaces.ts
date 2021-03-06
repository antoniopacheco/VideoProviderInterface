import getCompatibleResolutions, { Resolution } from './getResolution';
export interface Participant {
  videoTrack: any;
  audioTrack: any;
  screenVideoTrack: any;
  isLocal: boolean;
}

interface VideoDevices extends MediaDeviceInfo {
  availableRes?: Resolution[];
}

type CallbackOneParam = (param?: any) => any;

interface Listener {
  oneTime: boolean;
  callBack: CallbackOneParam;
}

interface ListenerMap {
  [key: string]: Listener[];
}

export abstract class VideoInterface {
  library: any;
  libraryName: string;
  listeners: ListenerMap = {};
  videoDevices: VideoDevices[] = [];
  audioDevices: MediaDeviceInfo[] = [];
  audioOutputDevices: MediaDeviceInfo[] = [];

  constructor(props: any) {
    this.library = props.library;
    this.libraryName = props.libraryName;
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
  abstract selectCamera(deviceId: string, constrains: any): void;
  abstract selectAudio(deviceId: string): void;

  askPermissions = async () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(this.initDevices, (e) => {
        this.emit('error', 'permissions denied');
      });
  };

  getResolutions = async () => {
    this.videoDevices.forEach(async (videoDevice) => {
      const res = await getCompatibleResolutions(videoDevice);
      videoDevice.availableRes = res;
    });
  };

  initDevices = async (event: any, avoidResolutions: boolean = false) => {
    const devices: MediaDeviceInfo[] = await navigator.mediaDevices.enumerateDevices();

    this.videoDevices = devices.filter(
      (device) => device.kind === 'videoinput',
    );
    this.audioDevices = devices.filter(
      (device) => device.kind === 'audioinput',
    );
    this.audioOutputDevices = devices.filter(
      (device) => device.kind === 'audiooutput',
    );
    if (!avoidResolutions) {
      this.getResolutions();
    }
    this.emit('devices-changed', event);
  };

  startDeviceListener = () => {
    // Listen for changes to media devices and update the list accordingly
    navigator.mediaDevices.addEventListener('devicechange', (event) => {
      this.initDevices(event);
    });
  };

  getVideoDevices = (): VideoDevices[] => {
    return this.videoDevices;
  };

  getAudioDevices = (): MediaDeviceInfo[] => {
    return this.audioDevices;
  };

  getAudioOutputDevices = (): MediaDeviceInfo[] => {
    return this.audioOutputDevices;
  };

  addListener(name: string, callBack: any, oneTime: boolean): void {
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push({
      oneTime,
      callBack,
    });
  }

  on(name: string, callBack: any): void {
    this.addListener(name, callBack, false);
  }

  off(name: string, callBack: any): void {
    if (this.listeners[name]) {
      this.listeners[name] = this.listeners[name].filter(
        (el: any) => el.callBack !== callBack,
      );
    }
  }

  once(name: string, callBack: any): void {
    this.addListener(name, callBack, true);
  }

  emit(name: string, params: any): void {
    if (this.listeners[name]) {
      this.listeners[name].forEach((action: any, index: number) => {
        action.callBack(params);
        if (action.oneTime) {
          this.off(name, action.callBack);
        }
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
