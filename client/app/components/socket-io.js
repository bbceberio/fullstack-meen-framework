import Ember from 'ember';
const { inject: { service }, Logger } = Ember;

export default Ember.Component.extend({
  websockets: service(),
  socketIO: service('socket-io'),
  socketRef: null,

  didInsertElement() {
    this._super(...arguments);

    const socket = this.get('socketIO').socketFor('http://127.0.0.1:3000/');

    socket.on('connect', this.onConnect, this);
    socket.on('message', this.onMessage, this);
    socket.on('disconnect', () => { Logger.log('We have disconnected'); }, this);

    socket.on('myCustomEvent', this.myCustomEvent, this);
    socket.on('greeting-from-server', this.greetingFromServer, this);

    this.set('socketRef', socket);
  },

  onConnect() {
    const socket = this.get('socketRef');
    socket.send('Hello World');
    //socket.emit('Hello server');
  },

  onMessage() {
    const socket = this.get('socketRef');
    socket.send('My message');
  },

  myCustomEvent() {
    const socket = this.get('socketRef');
    socket.emit('anotherCustomEvent', 'some data');
  },

  greetingFromServer(message) {
    Logger.log(message.greeting);
    const socket = this.get('socketRef');
    socket.emit('greeting-from-client', {greeting: 'Hello Server'});
  },

  willDestroyElement() {
    this._super(...arguments);

    const socket = this.get('socketRef');
    socket.off('connect', this.onConnect);
    socket.off('message', this.onMessage);
    socket.off('myCustomEvent', this.myCustomEvent);
  },

  actions: {
    sendButtonPressed() {
      const socket = this.get('socketRef');
      socket.send('Hello Websocket World');
    }
  }
});
