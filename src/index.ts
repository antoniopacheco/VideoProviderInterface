import DailyCo from './providers/Dailyco';
import Twilio from './providers/Twilio';
import Jitsi from './providers/Jitsi';

export default class VideoProvider {
  constructor(libraryPackage: any, libraryName: string) {
    switch (libraryName) {
      case 'dailyco':
        return new DailyCo({ libraryName, library: libraryPackage });
      case 'twilio':
        return new Twilio({ libraryName, library: libraryPackage });
      case 'jitsi':
        return new Jitsi({ libraryName, library: libraryPackage });
      default:
        return new Error('Provider not supported');
    }
  }
}
