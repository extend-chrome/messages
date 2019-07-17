import {
  messages,
  onMessage,
  sendMessage,
} from '../../../src/index'

/* -------------------------------------------- */
/*                test simple api               */
/* -------------------------------------------- */

/* ----------- send one-way message ----------- */

export const testOn = () => {
  return new Promise((resolve) => {
    messages.on((message) => {
      resolve(message)
    })
  })
}

export const testSend = (message: any) => messages.send(message)

/* ------------ send async message ------------ */

export const testAsyncOn = (response: any) => {
  return new Promise((resolve) => {
    messages.asyncOn((message, sender, respond) => {
      respond(response)
      resolve(message)
    })
  })
}

export const testAsyncSend = (message: any) =>
  messages.asyncSend(message)

/* -------------------------------------------- */
/*                test chrome api               */
/* -------------------------------------------- */

/* ------- send one-way targeted message ------ */

export const testOnMessage = (options: any) => {
  return new Promise((resolve) => {
    onMessage.addListener((message) => {
      resolve(message)
    }, options)
  })
}

export const testSendMessage = (message: any, options: any) =>
  sendMessage(message, options)

/* -------- send async targeted message ------- */

export const testAsyncOnMessage = (
  response: any,
  options: any,
) => {
  return new Promise((resolve) => {
    onMessage.addListener((message, sender, respond) => {
      // respond will be defined b/c async == true
      respond && respond(response)
      resolve(message)
    }, options)
  })
}

export const testAsyncSendMessage = (
  message: any,
  options: any,
) => sendMessage(message, options)
