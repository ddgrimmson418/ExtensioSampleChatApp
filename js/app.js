// Pubnub Chat engine publish key
const PUBLISH_KEY = 'pub-c-2c05d46c-617d-4a79-b5f3-0d31007c1398';

// Pubnub Chat engine subscription key
const SUBSCRIBE_KEY = 'sub-c-82f051a8-5f4e-11e8-9b53-6e008aa3b186';

// Chat Engine initialization with publish key and sbscription key 
let ChatEngine = ChatEngineCore.create({
  publishKey: PUBLISH_KEY,
  subscribeKey: SUBSCRIBE_KEY
});

// Function to read user nick name 
const getUserNickName = () => {
  const me = prompt('Enter Your Nickname');
  return me;

};

// Function to post status and messages to display windows
const appendMessage = (username, text) => {
  let message;
  if (username === 'Status') {
    message =
      $(`<div class='text-center'/>`)
      .append($(`<small>`).text(text));
  } else {
    message =
      $(`<div class='list-group-item' />`)
      .append($('<strong>').text(username + ': '))
      .append($('<span>').text(text));
  }
  $('#log').append(message);
  $('#log').animate({
    scrollTop: $('#log').prop('scrollHeight')
  }, 'slow');
};

const userNickName = getUserNickName();

const uuid = userNickName.concat(Math.random().toString());

// Connecting to Chat Room/ Channel
let me = ChatEngine.connect(uuid, {
  nickname: userNickName
});

ChatEngine.on('$.ready', (data) => {

  let me = data.me;

  changeNickname = () => {
    const newNickName = getUserNickName();
    const oldNickName = me.state.nickname;
    me.update({
      nickname: newNickName
    });
    $('#username').html('Welcome ' + me.state.nickname);
    chat.emit('message', 'Changed to ' + me.state.nickname);
  };

  // Creating the reference to an open chat room
  let chat = new ChatEngine.Chat('personal-chat');

  const config = {
    timeout: 1000
  };

  // Initializing typing indicator plugin
  chat.plugin(ChatEngineCore.plugin['chat-engine-typing-indicator'](config));

  // Event Call back for successful completion of Chat room Connection
  chat.on('$.connected', (payload) => {
    $('#username').html('Welcome ' + me.state.nickname);
    appendMessage('Status', me.state.nickname + ' Connected to chat!');
  });

  // Event Call back for listing members available in the chat
  chat.on('$.online.here', (payload) => {
    appendMessage('Status', payload.user.state.nickname + ' is in the channel!');
  });

  // Event Call back for listing online members in the chat
  chat.on('$.online.join', (payload) => {
    appendMessage('Status', payload.user.state.nickname + ' has come online!');
  });

  // Event Call back for emitting chat message as sent by user
  chat.on('message', (payload) => {
    appendMessage(payload.sender.state.nickname, payload.data.text);
  });

  // Event Call back for typing indicator plugin to show the user typing in the chat window
  chat.on('$typingIndicator.startTyping', (payload) => {
    if (payload.sender.uuid !== me.uuid) {
      $('#typingStatus').html(payload.sender.state.nickname + ' is typing...');
    }
  });

  // Event Call back for typing indicator plugin to show user stopped typing in the chat window
  chat.on('$typingIndicator.stopTyping', (payload) => {
    if (payload.sender.uuid !== me.uuid) {
      $('#typingStatus').html('');
    }
  });

  // Event Call back for typing indicator plugin to show the user went offline or has made an 
  // exit from the chat room
  chat.on('$.offline.*', (payload) => {
    appendMessage('Status', 'User ' + payload.user.state.nickname + ' left the channel!');
  });

  // Utility function for sending the message
  sendMessage = () => {
    const msg = $('#message').val();
    if (msg) {
      chat.emit('message', {
        text: msg
      });
      $('#message').val('');
    }
  };

  // Function to send messages on pressing "Enter/Return" Key
  $('#message').keypress(function (event) {
    chat.typingIndicator.startTyping();
    if (event.which == 13) {
      sendMessage();
      chat.typingIndicator.stopTyping();
      event.preventDefault();
    }
  });

  // Destroy the session of application on exit from the tab
  window.onbeforeunload = function () {
    chat.leave();
  };

});