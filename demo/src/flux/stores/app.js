import alt from '../alt';

const Actions = alt.actions.AppActions;

class AppStore {

  constructor() {
    this.setDefaults();

    this.bindListeners({
      setMonitorWindowSize: Actions.monitorWindowSize,
      setWindowSize: Actions.setWindowSize,
    });
  }

  reset() {
    this.setDefaults();
  }

  setDefaults() {
    this.monitorWindowSize = false;
    this.windowSize = 'lg';
  }
  
  setCurrentWindowSize(value) {
    this.currentWindowSize = value;
  }

  setMonitorWindowSize(value) {
    this.monitorWindowSize = value;
  }

  setWindowSize(value) {
    this.windowSize = value;
  }
}

export default alt.createStore(AppStore);
