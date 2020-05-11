import { VideoInterface, Participant } from '../Interfaces';

// https://github.com/jitsi/lib-jitsi-meet/blob/master/doc/API.md#installation
export default class Jitsi extends VideoInterface {
  room: any;
  connection: any;

  constructor(props: any) {
    super(props);
    this.library.init();
    this.connection = new this.library.JitsiConnection(null, null, {});
  }

  addRoomListeners(): void {
    this.room.on(this.library.events.conference.TRACK_ADDED, (e: any) => {
      this.emit('participant-joined', e);
    });
    this.room.on(this.library.events.conference.CONFERENCE_JOINED, (e: any) => {
      this.emit('joined-meeting', e);
    });
  }

  addConnectionListeners(): void {
    this.connection.addEventListener(
      this.library.events.connection.CONNECTION_ESTABLISHED,
      (e: any) => {
        this.room = this.connection.initJitsiConference('conference1', {});
        this.addRoomListeners();
        this.room.join();
      },
    );
    this.connection.addEventListener(
      this.library.events.connection.CONNECTION_FAILED,
      (e: any) => {
        this.emit('error', e);
      },
    );
    this.connection.addEventListener(
      this.library.events.connection.CONNECTION_DISCONNECTED,
      (e: any) => {
        this.emit('error', e);
      },
    );
  }

  join(config: any): void {
    this.addConnectionListeners();
    // this.library.createLocalTracks().then(onLocalTracks);
    this.connection.connect();
  }

  leave(): void {
    return;
  }
  destroy(): void {
    return;
  }
  startScreenShare(): void {
    return;
  }
  stopScreenShare(): void {
    return;
  }
  participants(): Participant[] {
    return [];
  }
  meetingState(): string {
    return 'TODO';
  }
  cycleCamera(): void {
    return;
  }
  setLocalVideo(mute: boolean): void {
    return;
  }
  setLocalAudio(mute: boolean): void {
    return;
  }
  selectCamera(deviceId: string): void {
    return;
  }
  selectAudio(deviceId: string): void {
    return;
  }
}
