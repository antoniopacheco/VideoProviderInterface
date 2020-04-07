import { VideoInterface, Participant } from '../Interfaces';

export default class DailyCo extends VideoInterface {
  constructor(props: any) {
    super(props);
    this.library.on('joined-meeting', () => {
      this.emit('joined');
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

  participants() {
    return this.library.participants().map(([id, participant]: [any, any]) => {
      const [videoTrack, audioTrack, isLoading] = participant;
      return {
        videoTrack,
        audioTrack,
        isLocal: id === 'local',
      };
    });
  }
}
