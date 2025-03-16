import { useState } from 'react';

export function App() {
  const [users, setUsers] = useState([]);

  const handleFetchUsers = () => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => setUsers(data));
  };

  return (
    <div className="app">
      <h1>React Test App</h1>
      <div>
        <button onClick={handleFetchUsers}>Fetch Users</button>
        <hr />
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </div>
    </div>
  );
}

export default App;
