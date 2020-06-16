export interface Resolution {
  label: string;
  width: number;
  height: number;
  ratio: string;
}

const quickScan = [
  {
    label: '4K(UHD)',
    width: 3840,
    height: 2160,
    ratio: '16:9',
  },
  {
    label: '1080p(FHD)',
    width: 1920,
    height: 1080,
    ratio: '16:9',
  },
  {
    label: 'UXGA',
    width: 1600,
    height: 1200,
    ratio: '4:3',
  },
  {
    label: '720p(HD)',
    width: 1280,
    height: 720,
    ratio: '16:9',
  },
  {
    label: 'SVGA',
    width: 800,
    height: 600,
    ratio: '4:3',
  },
  {
    label: 'VGA',
    width: 640,
    height: 480,
    ratio: '4:3',
  },
  {
    label: '360p(nHD)',
    width: 640,
    height: 360,
    ratio: '16:9',
  },
  {
    label: 'CIF',
    width: 352,
    height: 288,
    ratio: '4:3',
  },
  {
    label: 'QVGA',
    width: 320,
    height: 240,
    ratio: '4:3',
  },
  {
    label: 'QCIF',
    width: 176,
    height: 144,
    ratio: '4:3',
  },
  {
    label: 'QQVGA',
    width: 160,
    height: 120,
    ratio: '4:3',
  },
];
let stream: any;

const getCompatibleResolutions = async (device: any): Promise<Resolution[]> => {
  const video = document.createElement('video');
  document.body.appendChild(video);
  const results = [];

  const gum = async (candidate: any) => {
    // Kill any running streams;
    if (stream) {
      stream.getTracks().forEach((track: any) => {
        track.stop();
      });
    }
    let compatible = false;

    // create constraints object
    const constraints = {
      audio: false,
      video: {
        deviceId: device.deviceId ? { exact: device.deviceId } : undefined,
        width: { exact: candidate.width },
        height: { exact: candidate.height },
      },
    };

    try {
      const stream2 = await navigator.mediaDevices.getUserMedia(constraints);
      gotStream(stream2);
      compatible = true;
    } catch (e) {
      compatible = false;
    }
    function gotStream(mediaStream: any) {
      // change the video dimensions
      video.width = candidate.width;
      video.height = candidate.height;
      stream = mediaStream; // make globally available
      video.srcObject = mediaStream;
    }

    return compatible;
  };

  for (const scanOption of quickScan) {
    const compatible = await gum(scanOption);
    if (compatible) {
      results.push(scanOption);
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  document.body.removeChild(video);

  return results;
};

export default getCompatibleResolutions;
