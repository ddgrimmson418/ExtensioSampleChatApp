const PUBLISH_KEY = 'pub-c-2c05d46c-617d-4a79-b5f3-0d31007c1398';
const SUBSCRIBE_KEY = 'sub-c-82f051a8-5f4e-11e8-9b53-6e008aa3b186';

let ChatEngine = ChatEngineCore.create({
    publishKey: PUBLISH_KEY,
    subscribeKey: SUBSCRIBE_KEY
});

const getUsername = () => {
    const me = prompt("Enter Your Nickname");
    return me
    
};


const getColor = () => {
  const colors =   ["Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Teal"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const appendMessage = (username, text) => {

  let message =
    $(`<div class="list-group-item" />`)
      .append($('<strong>').text(username + ': '))
      .append($('<span>').text(text));

  $('#log').append(message);
  $("#log").animate({ scrollTop: $('#log').prop("scrollHeight") }, "slow");
};

let me = ChatEngine.connect(getUsername(), {color: getColor()});

ChatEngine.on('$.ready', (data) => {

    let me = data.me;

    let chat = new ChatEngine.Chat('new-chat');

    chat.on('$.connected', (payload) => {
      $("#username").html('Welcome ' + me.uuid);
      appendMessage(me.uuid , 'Connected to chat!');
    });

    chat.on('$.online.here', (payload) => {
      appendMessage('Status', payload.user.uuid + ' is in the channel! Their color is ' + payload.user.state.color + '.');
    });

    chat.on('$.online.join', (payload) => {
      appendMessage('Status', payload.user.uuid + ' has come online! Their color is ' + payload.user.state.color + '.');
    });

    chat.on('message', (payload) => {
      appendMessage(payload.sender.uuid, payload.data.text);
    });

    $("#message").keypress(function(event) {
      if (event.which == 13) {
          chat.emit('message', {
                  text: $('#message').val()
          });
          $("#message").val('');
          event.preventDefault();
      }
    });
});