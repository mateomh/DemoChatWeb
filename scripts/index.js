
// VCDEV Config
const config = {
  appId: 'Chat_cancilleria',
  apiUrl: 'https://vcdev.brightpattern.com/clientweb/api/v1',
  tenantUrl: 'vcdev.brightpattern.com',
  chatPath: 'https://vcdev.brightpattern.com/clientweb/chat-client-v4/'
};

// CANCILLERIA Config
// const config = {
//   appId: 'BotCancilleria',
//   apiUrl: 'https://vccancilleria.brightpattern.com/clientweb/api/v1',
//   tenantUrl: 'vccancilleria.brightpattern.com',
//   chatPath: 'https://vccancilleria.brightpattern.com/clientweb/chat-client-v4/'
// }

let activeChatID;
let listener;

const chatEventListener = () => {
  listener = setInterval(async () => {
    controlPanel('NEW_EVENTS');
  }, 5000);
};

const clickStartChat = () => {
  const button = document.getElementById('start-chat');
  const chat = document.getElementById('chat');
  chat.classList.remove('hide');
  button.classList.add('hide');
  controlPanel('REQ_CHAT');
};

const clickSendMessage = () => {
  const msg = document.getElementById('message');
  const messages = document.getElementById('messages');
  messages.innerHTML += `<p class="chat-bubble-2">${msg.value}</p>`
  messages.scrollTop = messages.scrollHeight;
  const body = {
    events: [{
      event: 'chat_session_message',
      msg_id: Math.random(),
      msg: msg.value
    }]
  };
  controlPanel('SEND_MSG', body)
  msg.value = '';
};

const clickEndChat = () => {
  const messages = document.getElementById('messages');
  messages.innerHTML += `<p><b>Session Terminated</b></p>`
  const body = {
    events: [{
      event: 'chat_session_end',
    }]
  };
  controlPanel('CHAT_END', body);
};

const callApi = async (url, options) => {
  const resp = await fetch(url, options);
  return resp;
};

const controlPanel = async (action, body = null) => {
  const headers = {
    "Authorization": `MOBILE-API-140-327-PLAIN appId=${config.appId}, clientId=${config.clientId}`,
    "User-Agent": "MobileClient",
    "Content-Type": "application/json",
  };
  let options = {};
  let urlParams = `tenantUrl=${config.tenantUrl}`;
  let pathVars = '';
  let apiUrl = config.apiUrl;
  let response;
  let data;

  switch (action) {
    case 'REQ_CHAT':
      apiUrl = apiUrl + '/chats' + '?' + urlParams;
      options.method = 'POST';
      options.headers = headers;
      options.mode = 'cors';
      options.body = JSON.stringify({
        phone_number: 'Web Chat Tester',
        from: '<propagated into scenario variable $(item.from)>',
      });
      response = await callApi(apiUrl, options);
      data = await response.json();
      console.log('data2', data);
      activeChatID = data.chat_id;
      chatEventListener();
      break;
    case 'SEND_MSG':
      pathVars = activeChatID;
      apiUrl = apiUrl + '/chats/' + pathVars + '/events' + '?' + urlParams;
      options.method = 'POST';
      options.headers = headers;
      options.mode = 'cors';
      options.body = JSON.stringify(body);
      response = await callApi(apiUrl, options);
      console.log('data2', response);
      break;
    case 'CHAT_END':
      pathVars = activeChatID;
      apiUrl = apiUrl + '/chats/' + pathVars + '/events' + '?' + urlParams;
      options.method = 'POST';
      options.headers = headers;
      options.mode = 'cors';
      options.body = JSON.stringify(body);
      response = await callApi(apiUrl, options);
      console.log('data2', response);
      clearInterval(listener);
      break;
    case 'NEW_EVENTS':
      const messages = document.getElementById('messages');
      pathVars = activeChatID;
      apiUrl = apiUrl + '/chats/' + pathVars + '/events' + '?' + urlParams;
      options.method = 'GET';
      options.headers = headers;
      options.mode = 'cors';
      response = await callApi(apiUrl, options);
      data = await response.json();
      data = data.events.filter(data_point => data_point.event === 'chat_session_message');
      console.log('data2', data);
      data.map(message => messages.innerHTML += `<p class="chat-bubble-1">${message.msg}</p>`);
      messages.scrollTop = messages.scrollHeight;
      // chat_session_message
      break;
    default:
      break;
  }
};
