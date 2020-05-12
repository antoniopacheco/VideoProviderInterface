# Video Provider Interface

List of supported providers

- daily.co
- twilio
- Jitsi (In progress)

npm install --save video-provider-interface

```jsx
import VideoProvider from 'video-provider-interface';
const VP = new VideoProvider(VideoProviderLibrary, 'videoProverName');
```

daily co:

```jsx
import DailyIframe from '@daily-co/daily-js';
import VideoProvider from 'video-provider-interface';
...
const newCallObject = DailyIframe.createCallObject();
const VP = new VideoProvider(newCallObject, 'dailyco');
```

twilio:

```jsx
const Video = require('twilio-video');
import VideoProvider from 'video-provider-interface';
...
const VP = new VideoProvider(Video, 'twilio');
```

for a custom provider you can always import VideoInterface

```jsx
import { VideoInterface } from 'video-provider-interface';

class MyCustomProvider extends VideoInterface {}
```

## methods:

- join(config: any): void; // VP.join({url: dailyCoURL})
- leave(): void;
- destroy(): void;
- startScreenShare(): void;
- stopScreenShare(): void;
- participants(): Participant[];
- meetingState(): string;
- cycleCamera(): void;

### join

dailyco:

```jsx
VP.join({ url: 'urlToRoom' });
```

twilio:

```jsx
VP.join({ token: 'token', roomName: 'roomName' });
```

## Events

To listen an event you must use

```jsx
VP.on('event-name', callback);
VP.once('event-name-only-once', callback);
```

supported events:

- joined
- left
- participant-joined
- participant-updated
- participant-left
- error
- devices-changed

unsubscribe from an event

```jsx
VP.off('event-name', callback);
```

clear all events

```jsx
VP.clearListeners();
```

## Utils

### LoggerCallBack

```jsx
VP.logger([eventList], (event, provider, props) => {
  console.log(event, providers, props);
});
```

## Features supported

EE = Everyone Else

| Feature                     | Function Name                           | DailyCo            | Twilio             | Jitsi  |
| --------------------------- | --------------------------------------- | ------------------ | ------------------ | ------ |
| Join                        | join(config)                            | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| Leave                       | leave()                                 | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| Mute Camera                 | setLocalVideo(Boolean)                  | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| Mute Audio                  | setLocalAudio(Boolean)                  | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| Cycle Camera                | cycleCamera()                           | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| start ScreenShare           | startScreenShare()                      | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| List Video devices          | getVideoDevices()                       | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| List Audio devices          | getAudioDevices()                       | :heavy_check_mark: | :heavy_check_mark: | :soon: |
| Select Camera               | selectCamera(deviceId)                  | :heavy_check_mark: | :soon:             | :soon: |
| Select Audio                | selectAudio(deviceId)                   | :heavy_check_mark: | :soon:             | :soon: |
| mute EE Audio               | muteEEAudio()                           | :soon:             | :soon:             | :soon: |
| mute EE Video               | muteEEVideo()                           | :soon:             | :soon:             | :soon: |
| kick out                    | kick(id)                                | :soon:             | :soon:             | :soon: |
| Adjust Volume               | setVolume(level)                        | :soon:             | :soon:             | :soon: |
| Active Speaker Mode         | setActiveSpeakerView(level)             | :soon:             | :soon:             | :soon: |
| Present Custom Video Stream | sendCustomStream(streamMedia,presenter) | :soon:             | :heavy_check_mark: | :soon: |
