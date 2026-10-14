import { Image } from 'react-native';
import { captureScreen } from 'react-native-view-shot';

import type { Attachment } from './feedback';

// The screen she was on when she pressed the feedback bubble, as a JPEG in the
// cache. Metro picks this file on iOS and Android and screen-capture.ts on the
// web, so view-shot (and the html2canvas its web build wants) never reaches
// the browser bundle. Null when it can't: a build from before view-shot was
// added has no native module.

export async function captureCurrentScreen(): Promise<Attachment | null> {
  try {
    const uri = await captureScreen({ format: 'jpg', quality: 0.7, result: 'tmpfile' });
    return await new Promise((resolve) => {
      // Sized from the file, not the window: view-shot captures in pixels.
      Image.getSize(
        uri,
        (width, height) => resolve({ uri, width, height, auto: true }),
        () => resolve({ uri, width: 9, height: 19.5, auto: true }),
      );
    });
  } catch {
    return null;
  }
}
