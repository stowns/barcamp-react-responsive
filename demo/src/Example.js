import React, {Component} from 'react';
import ResponsiveComponent from './ResponsiveComponent';

/* flux */
import flux from './flux';
import connectToStores from 'alt-utils/lib/connectToStores';

class Example extends ResponsiveComponent {

  static getStores() {
    return [flux.stores.app];
  }

  static getPropsFromStores() {
    let appState = flux.stores.app.getState();

    return {
      windowSize: appState.windowSize
    };
  }

  renderMobile() {
    return (
      <div className="my-class">
        <h1>Mobile</h1>
      </div>
    )
  }

  renderDesktop() {
    return (
      <div className="my-class">
        <h1>Desktop</h1>
      </div>
    )
  }
}

export default connectToStores(Example)
