'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const token = 'EAAabt7BjpTMBAObnjLgRk1hordZB0gih0gRPpX8UDJdghaFiZCtx3HehfWJD6FVxQk9XEyvE2gdINFhZAlcnn9hw8GCAeuXJ4JToRXRZBo0TzMf2tBhUpBOi9bIyoRNml85ZArUiQaZA3XsYJeZCNvfF1ClrntkWa8EwrOJca81YAZDZD'
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.get('/', function (req, res) {
  res.send('test test')
})
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === '1234567') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
})
app.post('/webhook/', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      var location = event.message.text
      var weatherEndpoint = 'http://api.openweathermap.org/data/2.5/weather?q=' +location+ '&units=metric&appid=ea5272e74853f242bc0efa9fef3dd9f3'
      request({
        url: weatherEndpoint,
        json: true
      }, function(error, response, body) {
        try {
          var condition = body.main;
          sendTextMessage(sender, "อุณภูมิในวันนี้ คือ " + condition.temp + " "+"°C" + " " + "สภาพอากาศ" +" "+ condition.description  + " "+"ที่เมือง " + location);
        } catch(err) {
          console.error('error caught', err);
          sendTextMessage(sender, "กรุณากรอกชื่อเมืองให้ถูกต้อง เช่น London");
        }
      })

      if (text === 'Generic') {
        sendGenericMessage(sender)
        continue
      }
      var text2 = text.split(' ')
      sendTextMessage(sender, parseInt(text2[0]) + parseInt(text2[1]) )
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      sendTextMessage(sender,'สวัสดีผู้ใช้งานทุกท่านครับ ถ้าหากอยากทราบเกี่ยวกับสภาพอากาศกรุณากรอกชื่อเมืองที่คุณอยากรู้ได้เลยครับ')
      continue
    }
  }
  res.sendStatus(200)
})

function sendTextMessage (sender, text) {
  let messageData = { text: text }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

function sendGenericMessage (sender) {
  let messageData = {
    'attachment': {
      'type': 'template',
      'payload': {
        'template_type': 'generic',
        'elements': [{
          'title': 'First card',
          'subtitle': 'Element #1 of an hscroll',
          'image_url': 'http://messengerdemo.parseapp.com/img/rift.png',
          'buttons': [{
            'type': 'web_url',
            'url': 'https://www.messenger.com',
            'title': 'web url'
          }, {
            'type': 'postback',
            'title': 'Postback',
            'payload': 'Payload for first element in a generic bubble'
          }]
        }, {
          'title': 'Second card',
          'subtitle': 'Element #2 of an hscroll',
          'image_url': 'http://messengerdemo.parseapp.com/img/gearvr.png',
          'buttons': [{
            'type': 'postback',
            'title': 'Postback',
            'payload': 'Payload for second element in a generic bubble'
          }]
        }]
      }
    }
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
