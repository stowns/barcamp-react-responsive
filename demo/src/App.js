import React, {Component} from 'react';
import Example from './Example';
import Example2 from './Example2';
/* flux */
import flux from './flux';
import connectToStores from 'alt-utils/lib/connectToStores';

class App extends Component {
  
  static componentDidConnect() {
    flux.actions.app.monitorWindowSize(true);
  }

  static getStores(props) {
    console.log('get stores')
    return [flux.stores.app];
  }

  static getPropsFromStores(props) {
    let appState = flux.stores.app.getState();

    return {
      monitorWindowSize: appState.monitorWindowSize,
      windowSize: appState.windowSize
    };
  }

  componentDidMount() {
    console.log(JSON.stringify(flux.actions.app));
    console.log('app mounted')
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.monitorWindowSize !== this.props.monitorWindowSize) {
      this.setWindowSizeListeners(nextProps.monitorWindowSize);
    }
  }

  setWindowSizeListeners(enabled) {
    console.log(`setWindowSizeListeners ${enabled}`)
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
    if (size !== this.props.windowSize) {
      console.log(`updateWindowSize ${size}`)
      flux.actions.app.setWindowSize(size);
    }
  }

  componentWillUnmount() {
    flux.actions.app.monitorWindowSize(false);
  }

  render() {
    let style = {
      marginTop: 100
    };
    
    return (
      <div style={style} className='text-center'>
        <Example />
        <Example2 />
      </div>
    );
  }
}

export default connectToStores(App)
