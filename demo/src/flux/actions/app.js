import alt from '../alt';

class AppActions {

  constructor() {
    var simpleActions = [
      'monitorWindowSize',
      'setWindowSize'
    ];

    this.generateActions.apply(this, simpleActions);
  }
}

export default alt.createActions(AppActions);
