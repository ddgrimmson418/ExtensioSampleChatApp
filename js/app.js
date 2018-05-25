// require('chat-engine-typing-indicator');

const PUBLISH_KEY = 'pub-c-2c05d46c-617d-4a79-b5f3-0d31007c1398';

const SUBSCRIBE_KEY = 'sub-c-82f051a8-5f4e-11e8-9b53-6e008aa3b186';

let ChatEngine = ChatEngineCore.create({
    publishKey: PUBLISH_KEY,
    subscribeKey: SUBSCRIBE_KEY
});

const getUsername = () => {
    const me = prompt("Enter Your Nickname");
    return me;
    
};

const appendMessage = (username, text) => {

  let message =
    $(`<div class="list-group-item" />`)
      .append($('<strong>').text(username + ': '))
      .append($('<span>').text(text));

  $('#log').append(message);
  $("#log").animate({ scrollTop: $('#log').prop("scrollHeight") }, "slow");
};

const userNickName = getUsername();

const uuid = userNickName.concat(Math.random().toString());

let me = ChatEngine.connect(uuid, {nickname: userNickName});

ChatEngine.on('$.ready', (data) => {

    let me = data.me;

    changeNickname = () => {
      const newNickName = getUsername();
      const oldNickName = me.state.nickname;
      me.update({
        nickname: newNickName
      });
      $("#username").html('Welcome ' + me.state.nickname);
      chat.emit("message","Changed to " + me.state.nickname);
    };

    let chat = new ChatEngine.Chat('new-chat');

    const config = { timeout: 1000 };

    // chat.plugin( ChatEngineCore.plugin['chat-engine-typing-indicator'](config) );

    chat.on('$.connected', (payload) => {
      $("#username").html('Welcome ' + me.state.nickname);
      appendMessage(me.state.nickname , 'Connected to chat!');
    });

    chat.on('$.online.here', (payload) => {
      appendMessage('Status', payload.user.state.nickname + ' is in the channel!');
    });

    chat.on('$.online.join', (payload) => {
      appendMessage('Status', payload.user.state.nickname + ' has come online!');
    });

    chat.on('message', (payload) => {
      appendMessage(payload.sender.state.nickname, payload.data.text);
    });

    // chat.on('$typingIndicator.startTyping', (payload) => {
    //   if (!chat.isTyping) {
    //     console.log(payload.user, "is typing...");
    //   }
    // });

    // chat.on('$typingIndicator.stopTyping', (payload) => {
    //   if (!chat.isTyping) {
    //     console.log(payload.user, "is not typing...");
    //   }
    // });

    $("#message").keypress(function(event) {
      // chat.typingIndicator.startTyping();
      if (event.which == 13) {
          chat.emit('message', {
                  text: $('#message').val()
          });
          $("#message").val('');
          // chat.typingIndicator.stopTyping();
          event.preventDefault();
      }
    });

    chat.on("$.offline.leave", (payload) => {
      appendMessage("Status", "User " + payload.user.nickname + "left the channel!");
    });
    
    window.onunload = function() {
      alert("I am an alert!!")
      chat.leave();
    };
    
});
