const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
        session.reply("Here is your Ether ;)");
        session.reply(SOFA.Message({
          body: "Here is your Ether",
          attachments: [{
            "type": "image",
            "url": "ethereum.jpg"
        }]
      })) 
      break
  }
}

function onMessage(session, message) {
  if(message.body.toUpperCase() == 'HELP'){
    help(session)    
  }else
    if(message.body == 'Give me a turtle'){
      session.reply(SOFA.Message({
        body: "Here is your turtle",
        attachments: [{
          "type": "image",
          "url": "turtle.png"
        }]
      }))
    }else{
      session.reply(message)
    }
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'ping':
      pong(session)
      break
    case 'api':
      api(session)
      break
    case 'count':
      count(session)
      break
    case 'donate':
      donate(session)
      break
    case 'help':
      help(session)
      break
    case 'reset':
      reset(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessage(session, `Hello Token!`)
}

function api(session) {
  session.reply(SOFA.Message({
    body: 'You need to get your API key from Coinbase at https://www.coinbase.com/settings/api',
    showKeyboard: false,
  }))
  session.reply(SOFA.Message({
    body: 'I will need access to all the wallets you want to see the balances of and the ability to read your accounts.',
    showKeyboard: true,
  }))
}

function pong(session) {
  sendMessage(session, `Pong`)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, 'Count: ' + count)
}

function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(1))
  })
}

function help(session) {
  let controls = [
      {type: 'button', label: 'Set up Coinbase', value: 'api'},
      {type: 'button', label: 'Reset', value: 'reset'},
      {type: 'button', label: 'Donate', value: 'donate'}
    ]
    session.reply("I am a simple bot designed to help you interact with your Coinbase account.")
    session.reply("In order to use me, you will need to submit your API key because I am too lazy to learn how to implement OAuth2.")
    session.reply("My creator doesn't have access to your API key or your Coinbase account, but you don't have to believe me or him. You can check my code!") 
    session.reply("While you are checking out the code, feel free to contribute to the project.")
    session.reply(SOFA.Message({
    body: "The source code can be found at https://github.com/cooperfle/toshi-app-js",
    controls: controls,
    showKeyboard: false,
  }))
}

function reset(session) {
  //Clear set values
  session.reset()
  sendMessage(session,"Reset Session")
}
// HELPERS

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Ping', value: 'ping'},
    {type: 'button', label: 'Count', value: 'count'},
    {type: 'button', label: 'Reset', value: 'reset'},
    {type: 'button', label: 'Donate', value: 'donate'},
    {type: 'help', label: 'Help', value: 'help'}
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}
