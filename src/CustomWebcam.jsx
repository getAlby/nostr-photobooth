import axios from 'axios';
import { usePubkey, usePublish } from 'nostr-hooks';
import { nip19 } from 'nostr-tools';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';

import { createSplitAddress } from './utils/createSplitAddress';

const RELAYS = ['wss://relay.damus.io'];

// helper function: generate a new file from base64 String
// https://gist.github.com/ibreathebsb/a104a9297d5df4c8ae944a4ed149bcf1
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n) {
    u8arr[n - 1] = bstr.charCodeAt(n - 1);
    n -= 1; // to make eslint happy
  }
  return new File([u8arr], filename, { type: mime });
};

import Camera from './assets/camera.svg';

const CustomWebcam = (props) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  

  const ourPubkey = usePubkey();
  const publish = usePublish(RELAYS);

   const capture = useCallback(async () => {
    if (!props.persons.length) {
      alert('Please tag some users');
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    // generate file from base64 string
    const file = dataURLtoFile(imageSrc, 'upload.webp');
    // put file into form data
    const data = new FormData();
    data.append('fileToUpload', file, file.name);
    // now upload to nostr.build
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    };
    let tags = [];
    const splitAddresses = [];
    let content = props.text;
    let badgeTags = [['a', '30009:' + ourPubkey + ':' + props.badgeName]];
    for (let i = 0; i < props.persons.length; i++) {
      let person = props.persons[i];
      let npub = nip19.npubEncode(person.pubkey);
      tags.push(['p', person.pubkey]);
      if (person.lud16) {
        splitAddresses.push(person.lud16);
      } else {
        console.warn(person.pubkey + ' does not have a lightning address');
      }
      badgeTags.push(['p', person.pubkey]);
      content = content + `#[`+ i+ `]` + ' ';
    }
    const splitAddress = await createSplitAddress(splitAddresses);
    tags.push(['zap', splitAddress, 'lud16']);

    axios
      .post('https://nostr.build/upload.php', data, config)
      .then(async (response) => {
        const data = response.data.toString();
        const uploadedUrl = data.match('https://nostr.build/i/[^<]*')[0];
        await publish({ content: content + uploadedUrl, tags, kind: 1 });
        //publish badge event
        await publish({ tags: badgeTags, kind: 8 });
      });
  }, [webcamRef, publish, props.persons]);

  return (
    <>
      {imgSrc ? (
        <img
          src={imgSrc}
          className="w-full"
          style={{ border: '20px solid #FFDE6E', borderRadius: '56px' }}
          alt="webcam"
        />
      ) : (
        <Webcam
          className="w-full"
          style={{ border: '20px solid #FFDE6E', borderRadius: '56px' }}
          ref={webcamRef}
        />
      )}
        <button
          onClick={capture}
          className="bg-primary-gradient hover:bg-primary-gradient-hover my-12 px-48 py-3.5 rounded-xl"
        >
          <img src={Camera} className="mx-auto h-9 w-9" />
        </button>
    </>
  );
};
export default CustomWebcam;
