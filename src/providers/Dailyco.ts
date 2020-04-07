import { VideoInterface, Participant } from '../Interfaces';

export default class DailyCo extends VideoInterface {
  constructor(props: any) {
    super(props);
    this.library.on('joined-meeting', (e: any) => {
      this.emit('joined', e);
    });
    this.library.on('left-meeting', (e: any) => {
      this.emit('left', e);
    });
    this.library.on('participant-joined', (e: any) => {
      this.emit('participant-joined', e);
    });
    this.library.on('participant-updated', (e: any) => {
      this.emit('participant-updated', e);
    });
    this.library.on('participant-left', (e: any) => {
      this.emit('participant-left', e);
    });
    this.library.on('error', (e: any) => {
      this.emit('error', e);
    });
  }
  join(url: string) {
    return this.library.join({ url });
  }

  leave() {
    return this.library.leave();
  }

  destroy() {
    return this.library.destroy();
  }

  startScreenShare() {
    return this.library.startScreenShare();
  }

  stopScreenShare() {
    return this.library.stopScreenShare();
  }

  meetingState() {
    // joined-meeting, left-meeting, error
    return this.library.meetingState();
  }

  cycleCamera() {
    return this.library.cycleCamera();
  }

  participants() {
    return Object.entries(this.library.participants()).reduce(
      (ac: any[], [key, val]: [string, any]) => {
        debugger;
        const { audioTrack, videoTrack, screenVideoTrack } = val;
        ac.push({
          id: key,
          audioTrack,
          videoTrack,
          screenVideoTrack,
          isLocal: key === 'local',
        });
        return ac;
      },
      [],
    );
  }
}
