import DailyCo from './providers/Dailyco';
import Twilio from './providers/Twilio';

export default class VideoProvider {
  constructor(libraryPackage: any, libraryName: string) {
    switch (libraryName) {
      case 'dailyco':
        return new DailyCo({ libraryName, library: libraryPackage });
      case 'twilio':
        return new Twilio({ libraryName, library: libraryPackage });
      default:
        return new Error('Provider not supported');
    }
  }
}
