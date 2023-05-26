import React, { useState } from 'react';
import axios from 'axios'

const SearchBox = ({ addPerson }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
	let resp = await axios.get(
		`https://api.nostr.band/nostr?method=search&count=5&q=${query}`
	)
	let person = resp.data.people[0]
  addPerson(person)
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

    </form>
  );
};

export default SearchBox;
