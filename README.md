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

unsubscribe from an event

```jsx
VP.off('event-name', callback);
```

clear all events

```jsx
VP.clearListeners();
```

## features supported

| Provider | Mute Camera        | Mute Audio         | Cycle Camera       | Screen Share       | Leave              |
| -------- | ------------------ | ------------------ | ------------------ | ------------------ | ------------------ |
| daily.co | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| twilio   | :heavy_check_mark: | :soon:             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
