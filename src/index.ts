import DailyCo from './providers/Dailyco';

export default class VideoProvider {
  constructor(libraryPackage: any, libraryName: string) {
    switch (libraryName) {
      case 'dailyco':
        return new DailyCo({ library: libraryPackage });
      default:
        return new Error('Provider not supported');
    }
  }
}
