import React, { useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import classNames from 'classnames';
import { Person } from './types/Person';

function debounce(callback: (value: string) => void, delay: number) {
  let timerId: number;

  return (value: string) => {
    clearTimeout(timerId);

    timerId = window.setTimeout(() => {
      callback(value);
    }, delay);
  };
}

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const applyQuery = debounce(setAppliedQuery, 300);

  const peopleWithId = peopleFromServer.map((person, index) => ({
    ...person,
    id: index + 1,
  }));

  const filteredPeople = appliedQuery
    ? peopleWithId.filter(person => person.name.includes(appliedQuery))
    : peopleWithId;

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === query) {
      return;
    }

    setQuery(value);
    setSelectedPerson(null);
    setIsOpen(true);
    applyQuery(value);
  };

  const onSelected = (personId: number) => {
    const found = filteredPeople.find(person => person.id === personId);

    if (found) {
      setQuery(found.name);
      setAppliedQuery(found.name);
      setSelectedPerson(found);
      setIsOpen(false);
    }
  };

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson !== null
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div className={classNames('dropdown', { 'is-active': isOpen })}>
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={query}
              onChange={handleQueryChange}
              onFocus={() => setIsOpen(true)}
            />
          </div>

          <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
            <div className="dropdown-content">
              {filteredPeople.map(person => (
                <div
                  key={person.id}
                  className="dropdown-item"
                  data-cy="suggestion-item"
                  onClick={() => onSelected(person.id)}
                >
                  <p
                    className={classNames({
                      'has-text-danger': selectedPerson?.id === person.id,
                      'has-text-link': selectedPerson?.id !== person.id,
                    })}
                  >
                    {person.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        {isOpen && filteredPeople.length === 0 && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
