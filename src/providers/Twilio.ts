import { VideoInterface } from '../Interfaces';

interface MediaStreamTrackPublishOptions {
  // import { LogLevels, Track } from 'twilio-video';
  name?: string;
  priority: any;
  logLevel: any;
}

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
    // events for when local participant change
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
  }
  destroy() {
    // TODO
    return null;
  }
  startScreenShare = () => {
    (navigator as any).mediaDevices
      .getDisplayMedia({
        audio: false,
        video: {
          frameRate: 10,
          height: 1080,
          width: 1920,
        },
      })
      .then((stream: any) => {
        const track = stream.getTracks()[0];
        // All video tracks are published with 'low' priority. This works because the video
        // track that is displayed in the 'MainParticipant' component will have it's priority
        // set to 'high' via track.setPriority()
        this.room.localParticipant
          .publishTrack(track, {
            name: 'screen', // Tracks can be named to easily find them later
            priority: 'low', // Priority is set to high by the subscriber when the video track is rendered
          } as MediaStreamTrackPublishOptions)
          .then(() => {
            this.emit('participant-updated', null);
          })
          .catch((e: any) => {
            this.emit('error', e);
          });
      })
      .catch((e: any) => {
        // Don't display an error if the user closes the screen share dialog
        if (e.name !== 'AbortError' && e.name !== 'NotAllowedError') {
          this.emit('error', e);
        }
      });
    return null;
  };
  stopScreenShare() {
    const currentSSTrack = this.getSSTrack(this.room.localParticipant);
    this.room.localParticipant.unpublishTrack(currentSSTrack);
    currentSSTrack.stop();
    this.emit('participant-updated', null);
    return null;
  }
  participants = () => {
    // todo make it same interface as dailyco
    const all: any[] = [];
    if (!this.room) {
      return all;
    }
    const local = this.room.localParticipant;
    const [localAudioTrack, localVideoTrack] = this.getTracksFromParticipant(
      local,
    );
    const localShareScreen = this.getSSTrack(local);
    all.push({
      isLocal: true,
      id: 'local',
      audioTrack: localAudioTrack,
      videoTrack: localVideoTrack,
      screenVideoTrack: localShareScreen
        ? localShareScreen.mediaStreamTrack
        : null,
    });
    if (this.room.participants) {
      const participantKeys = Array.from(this.room.participants.keys());
      participantKeys.forEach((key) => {
        const participant = this.room.participants.get(key);
        const [audioTrack, videoTrack] = this.getTracksFromParticipant(
          participant,
        );
        const screenVideoTrack = this.getSSTrack(participant);
        all.push({
          isLocal: false,
          id: key,
          audioTrack,
          videoTrack,
          screenVideoTrack: screenVideoTrack
            ? screenVideoTrack.mediaStreamTrack
            : null,
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
        return 'TODO';
      // left-meeting
      // error
    }
    return 'joining';
  }
  setLocalVideo = (mute: boolean) => {
    const { localParticipant } = this.room;
    if (mute) {
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
  setLocalAudio(mute: boolean) {
    const [audioTrack, video] = this.getTracksFromParticipant(
      this.room.localParticipant,
    );
    if (audioTrack) {
      if (mute) {
        audioTrack.enabled = false;
      } else {
        audioTrack.enabled = true;
      }
      this.emit('participant-updated', 'audio-changed');
    }
  }

  cycleCamera = () => {
    const { localParticipant } = this.room;
    const currentTrack = this.getLocalCurrentVideoTrack();
    const currentIndex = this.videoDevices.findIndex((device: any) => {
      return device.label === currentTrack.mediaStreamTrack.label;
    });
    const nextIndex =
      currentIndex === this.videoDevices.length - 1 ? 0 : currentIndex + 1;
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

  // get  share screen
  getSSTrack = (participant: any) => {
    if (!participant.videoTracks) return null;
    const temp: any = Array.from(participant.videoTracks).find(
      (item: any) => item[1].trackName === 'screen',
    );
    return temp ? temp[1].track : null;
  };

  getLocalCurrentVideoTrack = () => {
    const { localParticipant } = this.room;
    const currentTracks = Array.from(localParticipant.videoTracks.values()).map(
      (track: any) => track.track,
    );
    return currentTracks.find((track: any) => track.isStarted);
  };
}
