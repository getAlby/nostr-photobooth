import React, { useState } from 'react';
import axios from 'axios'

const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [profileName, setProfileName] = useState('');
  const [lud16, setLud16] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
	let resp = await axios.get(
		`https://api.nostr.band/nostr?method=search&count=5&q=${query}`
	)
	console.log(resp.data.people[0])
	let person = resp.data.people[0]
	setProfileName(person.name)
	setLud16(person.lud16)
	setProfileImage(person.picture)
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
	  <br/>
	  {profileName}
	  <br/>
	  <img 
	  width={50}
	  src={profileImage}></img>
	  <br/>
	  {lud16}
    </form>
  );
};

export default SearchBox;
