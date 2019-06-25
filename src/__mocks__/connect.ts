const {
  connect: _connect,
  connectAs,
  handleConnect,
  handleDisconnect,
} = jest.requireActual('../connect')

export { connectAs, handleConnect, handleDisconnect }

// Will this work?
export const connect = jest.fn(_connect)
