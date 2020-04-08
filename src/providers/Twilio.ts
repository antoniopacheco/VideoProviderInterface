import { VideoInterface } from '../Interfaces';
export default class Twilio extends VideoInterface {
  constructor(props: any) {
    super(props);
    this.createVideoDevices();
  }
  room: any;
  videoDevices: any[] = [];
  currentDeviceId: string = '';

  createVideoDevices = () => {
    navigator.mediaDevices.enumerateDevices().then((devices: any[]) => {
      this.videoDevices = devices.filter(
        (device: any) => device.kind === 'videoinput',
      );
    });
  };

  addEventListeners = () => {
    // participantConnected happens when a new participant comes in
    this.room.on('participantConnected', (participant: any) => {
      if (participant) {
        participant.on('trackSubscribed', (track: any) => {
          this.emit('participant-updated', track);
        });
        participant.on('trackUnsubscribed', (track: any) => {
          this.emit('participant-updated', track);
        });
      }
      this.emit('participant-joined', participant);
    });
    //events for when local participant change
    this.room.localParticipant.on('trackUnpublished', (track: any) => {
      this.emit('participant-updated', 'trackUnpublished');
    });
    this.room.localParticipant.on('trackPublished', (track: any) => {
      this.emit('participant-updated', 'trackPublished');
    });
    this.room.localParticipant.on('trackSubscribed', (track: any) => {
      this.emit('participant-updated', track);
    });
    this.room.localParticipant.on('trackUnsubscribed', (track: any) => {
      this.emit('participant-updated', track);
    });

    // this.room.once('disconnected', (error: any) =>
    //   this.room.participants.forEach((e: any) => {
    //     this.emit('participant-left', e);
    //   }),
    // );

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

  leave() {
    this.room.disconnect();
    //TODO
  }
  destroy() {}
  startScreenShare() {
    // TODO : https://github.com/twilio/twilio-video-app-react/blob/master/src/hooks/useScreenShareToggle/useScreenShareToggle.tsx
  }
  stopScreenShare() {
    // TODO : https://github.com/twilio/twilio-video-app-react/blob/master/src/hooks/useScreenShareToggle/useScreenShareToggle.tsx
  }
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
      participantKeys.forEach((key) => {
        const participant = this.room.participants.get(key);
        const [audioTrack, videoTrack] = this.getTracksFromParticipant(
          participant,
        );
        all.push({
          isLocal: false,
          id: key,
          audioTrack,
          videoTrack,
          screenVideoTrack: null,
        });
      });
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
    const a = this.room;
    if (!this.room) {
      return 'TODO';
    }
    switch (this.room.state) {
      case 'connected':
        return 'joined-meeting';
      default:
        debugger;
        return 'TODO';
      // left-meeting
      // error
    }
    return 'joining';
  }
  setLocalVideo = (muted: boolean) => {
    const { localParticipant } = this.room;
    if (muted) {
      if (localParticipant) {
        const currentVT = this.getLocalCurrentVideoTrack();
        if (currentVT) {
          // we save current this.currentDeviceId
          this.currentDeviceId = this.getDeviceIDBYlabel(
            currentVT.mediaStreamTrack.label,
          );
          const localTrackPublication = localParticipant.unpublishTrack(
            currentVT,
          );
          this.emit('participant-updated', 'manually on setlocal video');
          localParticipant.emit('trackUnpublished', localTrackPublication);
          currentVT.stop();
        }
      }
    } else {
      const deviceId = this.currentDeviceId || this.videoDevices[0].deviceId;
      this.library
        .createLocalVideoTrack({
          deviceId: { exact: deviceId },
        })
        .then((localVideoTrack: any) => {
          localParticipant.publishTrack(localVideoTrack);
          this.emit('participant-updated', 'manually on mute');
        });
    }
  };
  setLocalAudio(muted: boolean) {
    return this.library.setLocalAudio(muted);
  }

  cycleCamera = () => {
    const { localParticipant } = this.room;
    const currentTrack = this.getLocalCurrentVideoTrack();
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
        const localTrackPublication = localParticipant.unpublishTrack(
          currentTrack,
        );
        localParticipant.emit('trackUnpublished', localTrackPublication);
        currentTrack.stop();
        localParticipant.publishTrack(localVideoTrack);
        this.emit('participant-updated', null);
      });
  };

  getDeviceIDBYlabel = (label: string) => {
    return this.videoDevices.find((device: any) => device.label === label)
      .deviceId;
  };

  getLocalCurrentVideoTrack = () => {
    const { localParticipant } = this.room;
    const currentTracks = Array.from(localParticipant.videoTracks.values()).map(
      (track: any) => track.track,
    );
    return currentTracks.find((track: any) => track.isStarted);
  };
}
