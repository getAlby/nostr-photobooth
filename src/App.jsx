import { useCallback, useState } from 'react';

import CustomWebcam from './CustomWebcam';
import SearchBox from './SearchBox';

import AlbyLogo from './assets/alby-logo.svg';
import CrossIcon from './assets/cross.jsx';

function App() {
  const [persons, setPersons] = useState([]);
  const [badgeName, setBadgeName] = useState('alby_btc_prague');
  const [text, setText] = useState(
    'We visited Alby at @npub167n5w6cj2wseqtmk26zllc7n28uv9c4vw28k2kht206vnghe5a7stgzu3r 🥳 '
  );

  const addPerson = useCallback((person) => {
    setPersons((persons) => [...persons, person]);
  }, []);

  const removePersonByIndex = useCallback(
    (index) => {
      setPersons((persons) => [
        ...persons.slice(0, index),
        ...persons.slice(index + 1),
      ]);
    },
    []
  );

  return (
    <>
      <img src={AlbyLogo} className="absolute h-12 my-2 mx-4" />

      <nav className="text-xl mx-auto text-center text-primary p-4">
        <span className="text-purple-500 font-bold">Nostr</span> Photo Booth
      </nav>
      <div className="grid xl:grid-cols-2 mb-48">
        <div className="mx-4">
          <h2 className="text-4xl font-bold text-primary mb-6">
            Tag your Nostr profiles
          </h2>

          <SearchBox addPerson={addPerson} setBadgeName={setBadgeName} setText={setText} badgeName={badgeName} text={text}/>

          <ul className="mt-4">
            {persons.map((person, index) => (
              <div
                key={`${person.name}-${index}`}
                className="flex justify-between items-center text-white"
              >
                <div className="flex items-center py-2">
                  <img
                    className="bg-white rounded-full h-8 w-8"
                    src={person.picture}
                  />
                  <div className="ml-3 text-sm">
                    <h3 className="font-bold">{person.name}</h3>
                    <p className="font-medium">{person.lud16}</p>
                  </div>
                </div>

                <CrossIcon
                  className="cursor-pointer text-neutral-500"
                  onClick={() => removePersonByIndex(index)}
                />
              </div>
            ))}
          </ul>
        </div>
        <CustomWebcam persons={persons} badgeName={badgeName} text={text}/>
      </div>
    </>
  );
}

export default App;
