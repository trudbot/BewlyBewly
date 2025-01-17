import browser from 'webextension-polyfill'

function handleMessage(message: any, sender: any, sendResponse: any) {
  if (message.contentScriptQuery === 'getAccessKey') {
    const url = message.confirmUri
    fetch(url)
      .then(response => sendResponse({ accessKey: `${response.url}`.match(/access_key=([0-9a-z]{32})/)![1] }))
      .catch(error => console.error(error))
    return true
  }
  else if (message.contentScriptQuery === 'logout') {
    const url = `https://passport.bilibili.com/login/exit/v2?biliCSRF=${message.biliCSRF}`
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        biliCSRF: message.biliJct,
      }),
    })
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(error => console.error(error))
  }
}

function handleConnect() {
  browser.runtime.onMessage.removeListener(handleMessage)
  browser.runtime.onMessage.addListener(handleMessage)
}

export function setupAuthMsgLstnr() {
  browser.runtime.onConnect.removeListener(handleConnect)
  browser.runtime.onConnect.addListener(handleConnect)
}
