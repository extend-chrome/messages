export class MessagesError extends Error {
  public ports: Bumble.Messages.Ports

  constructor(message: string, ports: Bumble.Messages.Ports) {
    super(message)
    this.ports = { ...ports }
  }
}
