import CustomWebcam from "./CustomWebcam"
import SearchBox from "./SearchBox"
import { useState } from 'react';

import AlbyLogo from "./assets/alby-logo.svg"
import CrossIcon from "./assets/cross.jsx"

function App() {
  const [persons, setPersons] = useState([]);
  function addPerson(person){
    setPersons([...persons, person])
  }
  return (
    <>
      <img src={AlbyLogo} className="absolute h-12 my-2 mx-4"/>
      <nav className="text-xl mx-auto text-center text-primary p-4">
        <span className="text-purple-500 font-bold">Nostr</span> Photo Booth
      </nav>
      <div className="container mx-auto px-5 lg:px-36">
        <CustomWebcam persons={persons}></CustomWebcam>
        <div className="grid xl:grid-cols-2 mb-48">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-6">How it works?</h2>
            <ol className="list-inside list-decimal text-white">
              <li className="my-2">Every photo will be published on <span className="text-primary underline">Alby Nostr profile</span></li>
              <li className="my-2">Nostr profiles can be tagged to the photo</li>
              <li className="my-2">All zapps will be split between people tagged</li>
              <li className="my-2">Everyone tagged will receive a unique badge!</li>
            </ol>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-primary mb-6">Tag your Nostr profiles</h2>
            <SearchBox addPerson={addPerson}/>
            <ul className="mt-4">
              {persons.map((person, index) => 
                <div key={`person-${index}`} className="flex justify-between items-center text-white">
                  <div className="flex items-center">
                    <img className="bg-white rounded-full h-8 w-8" src={person.picture}></img>
                    <div className="ml-3 text-sm py-2">     
                      <h3 className="font-bold">{person.name}</h3>
                      <p className="font-medium">{person.lud16}</p>
                    </div>
                  </div>
                  <CrossIcon
                    className="cursor-pointer text-neutral-500"
                    onClick={() => {
                      const modified = [...persons];
                      modified.splice(index, 1);
                      console.log(modified)
                      setPersons(modified)
                    }}
                  />
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
