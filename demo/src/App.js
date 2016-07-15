import React, {Component} from 'react';
import Example from './Example';

/* flux */
import flux from './flux';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class App extends Component {

  static componentDidConnect(props) {
    flux.actions.app.monitorWindowSize(true);
  }

  static getStores() {
    return [flux.stores.app];
  }

  static getPropsFromStores() {
    let appState = flux.stores.app.getState();

    return {
      monitorWindowSize: appState.monitorWindowSize
    };
  }

  componentDidMount() {
    let test = "test";
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.monitorWindowSize !== this.props.monitorWindowSize) {
      this.setWindowSizeListeners(nextProps.monitorWindowSize);
    }
  }

  setWindowSizeListeners(enabled) {
    if (!enabled) {
      return $(window).off("resize");
    }

    this.checkWindowSize();
    $(window).resize(this.checkWindowSize.bind(this));
  }

  checkWindowSize() {
    if (window.matchMedia("screen and (max-width : 544px)").matches){
      this.updateWindowSize('xs');
    } else if (window.matchMedia("screen and (max-width : 768px)").matches) {
      this.updateWindowSize('sm');
    } else if (window.matchMedia("screen and (max-width : 992px)").matches) {
      this.updateWindowSize('md');
    } else {
      this.updateWindowSize('lg');
    }
  }

  updateWindowSize(size) {
    if (size !== this.state.currentWindowSize) {
      flux.actions.app.setWindowSize(size);
    }
  }

  componentWillUnmount() {
    flux.actions.app.monitorWindowSize(false);
  }

  render() {
    return (
      <Example />
    );
  }
}
