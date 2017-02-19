/*
 *
 * App
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

// actions
import { addChat, historyChat, authentication, session } from './actions';
// import { historyChat, authentication, session } from './actions';

// components
import ChatBox from './ChatBox';
import ChatContainer from './ChatContainer';
import ChatText from './ChatText';
import Login from './Login';

// socket
// import io from './socket';
const socket = io.connect('http://localhost:5009');

export class App extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.newChat = this.newChat.bind(this);
    this.login = this.login.bind(this);
    this.loadHistory = this.loadHistory.bind(this);
  }

  componentWillMount() {
    this.props.dispatch(addChat());
    this.props.dispatch(historyChat());
  }


  // login handler
  login(e) {
    const auth = document.getElementById('authbox');
    e.preventDefault();
    // trigger authentication on socket and send data to server
    socket.emit('authentication', auth.value, (data) => {
      const that = this;
      if (data) { // validate response from server
        this.props.dispatch(authentication(() => {
          that.props.dispatch(session(data));
          // auto scroll to bottom after login
          // setTimeout(function() {
          //   var elem = document.getElementById('chat-container');
          //   elem.scrollTop = elem.scrollHeight;
          // }, 50);
        }));
      }
    });
    auth.value = '';
  }

  // new chat handler
  newChat(e) {
    // auto scroll to bottom for new chat
    setTimeout(function() {
      var elem = document.getElementById('chat-container');
      elem.scrollTop = elem.scrollHeight;
    }, 50);
    const text = document.getElementById('chatbox');
    e.preventDefault();
    // trigger send chat on socket and send data to server
    socket.emit('send chat', text.value);
    text.value = '';
  }

  loadHistory() {
    this.props.dispatch(historyChat());
  }

  render() {

    // login status conditional
    const { login } = this.props.appState;
    if (login) {
      const { chat, user } = this.props.appState.chat && this.props.appState.user ? this.props.appState : null;
      // map chat list
      const mapChat = chat.map((index, keys) => {
        // check line break
        if (index === '<hr />') {
          return <hr key={keys} />
        } else {
          return <ChatText key={keys} name={index.name} txt={index.txt} stamp={index.stamp} />
        }
      });
      // map user list
      const mapUser = user.map((index, keys) => (
        <li key={keys}>{index}</li>
      ));
      // logged in
      return (
        <div>
          {/* <button onClick={this.loadHistory}>load chat</button> */}
          <ChatContainer mapChat={mapChat} loadHistory={this.loadHistory.bind(this)} />
          <ChatBox newChat={this.newChat} />
          <ul>{mapUser}</ul>
        </div>
      );
    } else {
      // logged out
      return (
        <Login login={this.login} />
      );
    } // end login status conditional
  }// end render
}

export default connect((store) => {
  return {
    appState: store.appState,
  }
})(App);
