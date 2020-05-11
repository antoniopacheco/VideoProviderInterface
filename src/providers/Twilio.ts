import { VideoInterface } from '../Interfaces';

interface MediaStreamTrackPublishOptions {
  // import { LogLevels, Track } from 'twilio-video';
  name?: string;
  priority: any;
  logLevel: any;
}

export default class Twilio extends VideoInterface {
  room: any;
  currentVideoDeviceID: string = '';
  currentAudioDeviceID: string = '';

  addListenerToParticipant = (participant: any) => {
    participant.on('trackUnpublished', (track: any) => {
      this.emit('participant-updated', 'trackUnpublished');
    });
    participant.on('trackPublished', (track: any) => {
      this.emit('participant-updated', 'trackPublished');
    });
    participant.on('trackSubscribed', (track: any) => {
      this.emit('participant-updated', 'trackSubscribed');
    });
    participant.on('trackUnsubscribed', (track: any) => {
      this.emit('participant-updated', 'trackUnsubscribed');
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
    this.room.participants.forEach((participant: any) => {
      this.addListenerToParticipant(participant);
    });
    // events for when local participant change
    this.addListenerToParticipant(this.room.localParticipant);

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
    this.setLocalVideo(true);
    this.setLocalAudio(true);
    this.room.disconnect();
    this.emit('left', null);
  }
  destroy() {
    // TODO
    return null;
  }
  startScreenShare = () => {
    (navigator as any).mediaDevices
      .getDisplayMedia({
        audio: true,
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
      userName: local.identity,
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
          userName: participant.identity,
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
          this.currentVideoDeviceID = this.getDeviceIDByLabel(
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
      const deviceId =
        this.currentVideoDeviceID || this.videoDevices[0].deviceId;
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
    const { localParticipant } = this.room;
    if (mute) {
      const [audioTrack, video] = this.getTracksFromParticipant(
        localParticipant,
      );

      audioTrack.enabled = false;
      this.currentAudioDeviceID = this.getDeviceIDByLabel(
        audioTrack.label,
        false,
      );
      const localTrackPublication = localParticipant.unpublishTrack(audioTrack);
      this.emit('participant-updated', 'manually on setLocalAudio');
      localParticipant.emit('trackUnpublished', localTrackPublication);
      audioTrack.enabled = false;
    } else {
      const deviceId =
        this.currentAudioDeviceID || this.audioDevices[0].deviceId;
      this.library
        .createLocalAudioTrack({
          deviceId: { exact: deviceId },
        })
        .then((localAudioTrack: any) => {
          localParticipant.publishTrack(localAudioTrack);
          this.emit('participant-updated', 'manually on mute');
        });
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

  getDeviceIDByLabel = (label: string, video = true) => {
    let device = null;
    if (video) {
      device = this.videoDevices.find((d: any) => d.label === label);
      if (device) {
        return device.deviceId;
      } else {
        return null;
      }
    }
    device = this.audioDevices.find((d: any) => d.label === label);
    if (device) {
      return device.deviceId;
    } else {
      return null;
    }
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

  selectAudio = (deviceId: string) => {
    // TODO
    // Check if is a valid Device
    const audioDevicesIds = this.audioDevices.map((x) => x.deviceId);
    if (!audioDevicesIds.includes(deviceId)) {
      this.emit('error', 'Device Not Found');
      return;
    }
    const { localParticipant } = this.room;
    if (!localParticipant) {
      return;
    }
    // Stop Current Audio
    this.setLocalAudio(true);
    // Create a new Stream Track
    this.library
      .createLocalAudioTrack({
        deviceId: { exact: deviceId },
      })
      .then((localAudioTrack: any) => {
        localParticipant.publishTrack(localAudioTrack);
        this.emit('participant-updated', 'audio device Selected');
      });
    // Attach Stream Track to localParticipant
  };

  selectCamera = (deviceId: string) => {
    // TODO
    // Check if is a valid Device
    const videoDevicesIds = this.videoDevices.map((x) => x.deviceId);
    if (!videoDevicesIds.includes(deviceId)) {
      this.emit('error', 'Device Not Found');
      return;
    }
    const { localParticipant } = this.room;
    if (!localParticipant) {
      return;
    }
    // Stop Current Video
    const currentVT = this.getLocalCurrentVideoTrack();
    if (currentVT) {
      const localTrackPublication = localParticipant.unpublishTrack(currentVT);
      localParticipant.emit('trackUnpublished', localTrackPublication);
      currentVT.stop();
    }

    // Create a new Stream Track
    this.library
      .createLocalVideoTrack({
        deviceId: { exact: deviceId },
      })
      .then((localVideoTrack: any) => {
        // Attach Stream Track to localParticipant
        localParticipant.publishTrack(localVideoTrack);
        this.emit('participant-updated', 'choose video source');
      })
      .catch((e: Error) => {
        this.emit('error', e);
      });
  };

  sendCustomStream = (stream: any) => {
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
  };
}
