# Video Provider Interface

List of supported providers

- daily.co

npm install --save video-provider-interface

```jsx
import VideoProvider from 'video-provider-interface';
const VP = new VideoProvider(newCallObject, 'dailyco');
```

## methods:

- join(url: string): void;
- leave(): void;
- destroy(): void;
- startScreenShare(): void;
- stopScreenShare(): void;
- participants(): Participant[];
- meetingState(): string;
- cycleCamera(): void;

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
