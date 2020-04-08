import DailyCo from './providers/Dailyco';
import Twilio from './providers/Twilio';

export default class VideoProvider {
  constructor(libraryPackage: any, libraryName: string) {
    switch (libraryName) {
      case 'dailyco':
        return new DailyCo({ library: libraryPackage });
      case 'twilio':
        return new Twilio({ library: libraryPackage });
      default:
        return new Error('Provider not supported');
    }
  }
}
