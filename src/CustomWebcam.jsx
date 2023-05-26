import Webcam from "react-webcam";
import { useCallback, useRef, useState } from "react"; // import useCallback
import axios from 'axios'
import { nip19, relayInit } from 'nostr-tools'

const CustomWebcam = (persons) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const relay = relayInit('wss://relay.damus.io')
  relay.on('connect', () => {
    console.log(`connected to ${relay.url}`)
  })
  relay.on('error', () => {
    console.log(`failed to connect to ${relay.url}`)
  })

  // helper function: generate a new file from base64 String
  // https://gist.github.com/ibreathebsb/a104a9297d5df4c8ae944a4ed149bcf1
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n) {
      u8arr[n - 1] = bstr.charCodeAt(n - 1)
      n -= 1 // to make eslint happy
    }
    return new File([u8arr], filename, { type: mime })
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    // generate file from base64 string
    const file = dataURLtoFile(imageSrc, "upload.webp");
    // put file into form data
    const data = new FormData()
    data.append('fileToUpload', file, file.name)
    // now upload to nostr.build
    const config = {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
     }
    }
    let tags = []
    let content = "Hi from us: "
    for (let i = 0; i < persons.persons.length; i++) {
      let person = persons.persons[i]
      let npub = nip19.npubEncode(person.pubkey)
      tags.push(["p", person.pubkey])
      tags.push(["zap", person.lud16, "lud16"])
      content = content + '@' + npub + " "
    }
    console.log(tags)
    console.log(content)
    axios.post('https://nostr.build/upload.php', data, config).then(async response => {
      const data = response.data.toString();
      const uploadedUrl = data.match('https://nostr.build/i/[^<]*')[0];
      let event = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: content + uploadedUrl,
      };
      let signed = await window.nostr.signEvent(event);
      await relay.connect()
      await relay.publish(signed);
    })
    
  }, [webcamRef, relay]);

  return (
	<div className="container">
	{imgSrc ? (
	  <img src={imgSrc} alt="webcam" />
	) : (
	  <Webcam height={600} width={600} ref={webcamRef} />
	)}
	<div className="btn-container">
	  <button onClick={capture}>Capture photo</button>
	</div>
  </div>
  );
};
export default CustomWebcam;