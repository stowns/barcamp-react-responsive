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

  setMonitorWindowSize(value) {
    this.monitorWindowSize = value;
  }

  setWindowSize(value) {
    this.windowSize = value;

    // update the main app's layout based on sub-app needs
    this.updateMainLayout()
  }
}

export default alt.createStore(AppStore);
