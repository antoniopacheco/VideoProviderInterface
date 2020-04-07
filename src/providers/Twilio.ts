import { VideoInterface } from '../Interfaces';
export default class Twilio extends VideoInterface {
  constructor(props: any) {
    super(props);
  }
  room: any;

  addEventListeners = (room: any) => {
    this.room = room;
    room.on('participantConnected', (e: any) => {
      this.emit('participant-joined', e);
    });

    room.on('participantDisconnected', (e: any) => {
      this.emit('participant-left', e);
    });
  };

  join(config: any) {
    this.library
      .connect(config.token, { name: config.roomName })
      .then((room: any) => {
        this.emit('joined', room);
        this.addEventListeners(room);
      });
  }

  leave() {}
  destroy() {}
  startScreenShare() {}
  stopScreenShare() {}
  participants() {
    // todo make it same interface as dailyco
    return this.room.participants;
  }
  meetingState() {
    return 'TODO';
  }
  cycleCamera() {}
}
