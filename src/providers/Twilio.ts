import { VideoInterface } from '../Interfaces';
export default class Twilio extends VideoInterface {
  constructor(props: any) {
    super(props);
    this.createVideoDevices();
  }
  room: any;
  videoDevices: any[] = [];
  createVideoDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((devices: any[]) => {
      this.videoDevices = devices.filter(
        (device: any) => device.kind === 'videoinput',
      );
    });
  };

  addEventListeners = () => {
    this.room.on('participantConnected', (e: any) => {
      this.emit('participant-joined', e);
    });

    this.room.on('participantDisconnected', (e: any) => {
      this.emit('participant-left', e);
    });
  };

  join(config: any) {
    this.library
      .connect(config.token, { name: config.roomName })
      .then((room: any) => {
        this.room = room;
        this.emit('joined', room);
        this.addEventListeners();
      })
      .catch((e: any) => {
        this.emit('error', e);
      });
  }

  leave() {}
  destroy() {}
  startScreenShare() {}
  stopScreenShare() {}
  participants = () => {
    // todo make it same interface as dailyco
    const all: any[] = [];
    if (!this.room) {
      return all;
    }
    const local = this.room.localParticipant;
    const [audioTrack, videoTrack] = this.getTracksFromParticipant(local);
    all.push({
      isLocal: true,
      id: 'local',
      audioTrack,
      videoTrack,
      screenVideoTrack: null,
    });
    if (this.room.participants) {
      const participantKeys = Array.from(this.room.participants.keys());
      const participants = participantKeys.map((key) => {
        const participant = this.room.participants.get(key);
        const [audioTrack, videoTrack] = this.getTracksFromParticipant(
          participant,
        );
        return {
          isLocal: false,
          id: key,
          audioTrack,
          videoTrack,
          screenVideoTrack: null,
        };
      });
      all.push(...participants);
    }
    return all;
  };

  getTracksFromParticipant(participant: any) {
    const { audioTracks, videoTracks } = participant;
    const audioKey = Array.from(audioTracks.keys())[0];
    const videoKey = Array.from(videoTracks.keys())[0];

    const audioTrackFull = audioKey ? audioTracks.get(audioKey).track : null;
    const videoTrackFull = videoKey ? videoTracks.get(videoKey).track : null;
    const audioTrack = audioTrackFull ? audioTrackFull.mediaStreamTrack : null;
    const videoTrack = videoTrackFull ? videoTrackFull.mediaStreamTrack : null;
    return [audioTrack, videoTrack];
  }
  meetingState() {
    return 'TODO';
  }
  cycleCamera = () => {
    // const b = this.room.localParticipant;
    const { localParticipant } = this.room;
    const currentTracks = Array.from(localParticipant.videoTracks.values()).map(
      (track: any) => track.track,
    );
    const currentTrack = currentTracks[0];
    const currentIndex = this.videoDevices.findIndex((device: any) => {
      return device.label === currentTrack.mediaStreamTrack.label;
    });
    const nextIndex =
      currentIndex == this.videoDevices.length - 1 ? 0 : currentIndex + 1;
    this.library
      .createLocalVideoTrack({
        deviceId: { exact: this.videoDevices[nextIndex].deviceId },
      })
      .then((localVideoTrack: any) => {
        localParticipant.unpublishTracks(currentTracks);
        localParticipant.publishTrack(localVideoTrack);
        this.emit('participant-updated', null);
      });
  };
}
