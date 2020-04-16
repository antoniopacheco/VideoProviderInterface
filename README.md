# Video Provider Interface

List of supported providers

- daily.co
- twilio

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
    VP.logger([eventList],(event, provider, props)=>{
        console.log(event,providers, props)
    })
```

## Features supported

EE = Everyone Else

| Feature                     | Function Name                           | DailyCo            | Twilio             |
| --------------------------- | --------------------------------------- | ------------------ | ------------------ |
| Join                        | join(config)                            | :heavy_check_mark: | :heavy_check_mark: |
| Leave                       | leave()                                 | :heavy_check_mark: | :heavy_check_mark: |
| Mute Camera                 | setLocalVideo(Boolean)                  | :heavy_check_mark: | :heavy_check_mark: |
| Mute Audio                  | setLocalAudio(Boolean)                  | :heavy_check_mark: | :heavy_check_mark: |
| Cycle Camera                | cycleCamera()                           | :heavy_check_mark: | :heavy_check_mark: |
| start ScreenShare           | startScreenShare()                      | :heavy_check_mark: | :heavy_check_mark: |
| List Video devices          | getVideoDevices()                       | :heavy_check_mark: | :heavy_check_mark: |
| List Audio devices          | getAudioDevices()                       | :heavy_check_mark: | :heavy_check_mark: |
| Select Camera               | selectCamera(deviceId)                  | :heavy_check_mark: | :soon:             |
| Select Audio                | selectAudio(deviceId)                   | :heavy_check_mark: | :soon:             |
| mute EE Audio               | muteEEAudio()                           | :soon:             | :soon:             |
| mute EE Video               | muteEEVideo()                           | :soon:             | :soon:             |
| kick out                    | kick(id)                                | :soon:             | :soon:             |
| Adjust Volume               | setVolume(level)                        | :soon:             | :soon:             |
| Active Speaker Mode         | setActiveSpeakerView(level)             | :soon:             | :soon:             |
| Present Custom Video Stream | sendCustomStream(streamMedia,presenter) | :soon:             | :heavy_check_mark: |
