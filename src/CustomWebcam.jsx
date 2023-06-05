import axios from 'axios';
import { usePublish } from 'nostr-hooks';
import { nip19 } from 'nostr-tools';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { createSplitAddress } from "./utils/createSplitAddress";

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

import Camera from "./assets/camera.svg"

const CustomWebcam = (persons) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [badgeName, setBadgeName] = useState("alby_btc_prague");
  const [text, setText] = useState("We visited Alby at @npub167n5w6cj2wseqtmk26zllc7n28uv9c4vw28k2kht206vnghe5a7stgzu3r 🥳 ");
  const handleTextChange = (event) => {
    setText(event.target.value);
  };
  const handleBadgeNameChange = (event) => {
    setBadgeName(event.target.value);
  };

  const publish = usePublish(RELAYS);


  const capture = useCallback(async () => {
    if (!persons.persons.length) {
      alert("Please tag some users");
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
    let content = text;
    const ourPubkey = window.nostr.getPublicKey()
    let badgeTags = [['a', '30009:'+ ourPubkey + ':' + badgeName]];
    for (let i = 0; i < persons.persons.length; i++) {
      let person = persons.persons[i];
      let npub = nip19.npubEncode(person.pubkey);
      tags.push(['p', person.pubkey]);
      if (person.lud16) {
        splitAddresses.push(person.lud16);
      }
      else {
        console.warn(person.pubkey + " does not have a lightning address")
      }
      badgeTags.push(['p', person.pubkey]);
      content = content + npub + ' ';
    }
    const splitAddress = await createSplitAddress(splitAddresses);
    tags.push(['zap', splitAddress, 'lud16']);

    console.log(tags);
    console.log(content);
    axios
      .post('https://nostr.build/upload.php', data, config)
      .then(async (response) => {
        const data = response.data.toString();
        const uploadedUrl = data.match('https://nostr.build/i/[^<]*')[0];
        await publish({ content: content + uploadedUrl, tags: tags, kind: 1 });
        //publish badge event
        await publish({tags: badgeTags, kind: 8})
      });
  }, [webcamRef, publish, persons.persons]);

  return (
    <>
      {imgSrc ? (
        <img src={imgSrc} className="w-full" style={{border: "24px solid #FFDE6E", borderRadius: "56px"}} alt="webcam" />
      ) : (
        <Webcam className="w-full" style={{border: "24px solid #FFDE6E", borderRadius: "56px"}} ref={webcamRef} />
      )}
      <label >
        Badge name
      </label>
      <input value={badgeName} onChange={handleBadgeNameChange}
      style={{
          padding: '10px',
          borderRadius: '5px',
          background: '#ccc',
          margin: '10px',
        }}>
      </input>
       <textarea
        value={text}
        onChange={handleTextChange}
        rows={4} // Number of visible rows
        cols={40} // Number of visible columns
        style={{
          padding: '10px',
          borderRadius: '5px',
          background: '#ccc',
          margin: '10px',
        }}
      />
      <div className="flex justify-center">
        <button onClick={capture} className="bg-primary-gradient hover:bg-primary-gradient-hover my-12 px-48 py-3.5 rounded-xl">
          <img src={Camera} className="mx-auto h-9 w-9"/>
        </button>
      </div>
    </>
  );
};
export default CustomWebcam;
