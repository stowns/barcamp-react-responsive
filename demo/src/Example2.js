import React, {Component} from 'react';
import ResponsiveComponent from './ResponsiveComponent';

/* flux */
import flux from './flux';
import connectToStores from 'alt-utils/lib/connectToStores';

class Example2 extends ResponsiveComponent {

  static getStores() {
    return [flux.stores.app];
  }

  static getPropsFromStores() {
    let appState = flux.stores.app.getState();

    return {
      windowSize: appState.windowSize
    };
  }
  
  renderExtraSmall() {
    return (
      <div>
        <div>Extra Small</div>
      </div>
    )
  }

  renderSmall() {
    return (
      <div>
        <div>Small</div>
      </div>
    )
  }

  renderDesktop() {
    return (
      <div>
        <div>Desktop</div>
      </div>
    )
  }
}

export default connectToStores(Example2)
