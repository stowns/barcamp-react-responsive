import React, {Component} from 'react';
import ResponsiveComponent from './ResponsiveComponent';

/* flux */
import flux from './flux';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
export default class Example extends ResponsiveComponent {

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
      <div>Mobile</div>
    )
  }

  renderDesktop() {
    return (
      <div>Desktop</div>
    )
  }
}
