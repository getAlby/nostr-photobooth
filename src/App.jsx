import CustomWebcam from './CustomWebcam';
import SearchBox from './SearchBox';
import React, { useState } from 'react';

function App() {
  const [persons, setPersons] = useState([]);
  function addPerson(person) {
    setPersons([...persons, person]);
  }
  return (
    <>
      <div className="App">
        <div>
          <SearchBox addPerson={addPerson} />
        </div>
        <div>
          <p>Adding profiles:</p>
          <ul>
            {persons.map((person) => (
              <div>
                <img width={50} src={person.picture}></img>
                <br></br>
                {person.lud16}
              </div>
            ))}
          </ul>
        </div>
        <CustomWebcam persons={persons}></CustomWebcam>
      </div>
    </>
  );
}

export default App;
