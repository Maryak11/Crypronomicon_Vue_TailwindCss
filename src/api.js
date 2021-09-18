const tickers = new Map()
const AGREGATE_INDEX = '5'
const socket = new WebSocket(
  'wss://streamer.cryptocompare.com/v2?api_key=c80a7f63845ffc23a7054290e46b080cbd584e56fc4c470fdabe61995251f18e'
)

socket.addEventListener('message', e => {
  const {
    TYPE: type,
    FROMSYMBOL: currentTicker,
    PRICE: newPrice
  } = JSON.parse(e.data)
  if (type !== AGREGATE_INDEX || newPrice === undefined) {
    return
  }
  console.log(currentTicker, newPrice)
  const handlers = tickers.get(currentTicker) ?? []
  handlers.forEach(fn => fn(newPrice))
})
const subcribeOnWebSocket = ticker => {
  const message = JSON.stringify({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`]
  })
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message)
    return
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(message)
    },
    { once: true }
  )
}

export const toSubscribeToTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || []
  tickers.set(ticker, [...subscribers, cb])
  subcribeOnWebSocket(ticker)
}
const unSubscribeFromSocket = ticker => {
  socket.send(
    JSON.stringify({ action: 'SubRemove', subs: [`5~CCCAGG~${ticker}~USD`] })
  )
}
export const unSubscribeFromTicker = ticker => {
  unSubscribeFromSocket(ticker)
  tickers.delete(ticker)
}

window.tickers = tickers
