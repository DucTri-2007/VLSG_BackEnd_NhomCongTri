import React, { Component } from 'react';
import MyContext from './contexts/MyContext';
import Main from './components/MainComponent';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      username: '',
      setToken: (token) => {
        this.setState({ token: token });
      },
      setUsername: (username) => {
        this.setState({ username: username });
      }
    };
  }

  render() {
    return (
      <MyContext.Provider value={this.state}>
        <Main />
      </MyContext.Provider>
    );
  }
}

export default App;
