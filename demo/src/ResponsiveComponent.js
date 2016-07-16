'use strict';

import React, {Component} from 'react';
import _ from 'lodash';

const methodMap = {
  xs: 'ExtraSmall',
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
  desktop: 'Desktop',
  mobile: 'Mobile'
};

export default class ResponsiveComponent extends Component {

  render() {
    let markup;
    if (['xs', 'sm'].indexOf(this.props.windowSize) != -1) {
      if (this.renderMobile) {
        markup = this.renderMobile();
      } else {
        markup = this.renderSize();
      }
    } else {
      if (this.renderDesktop) {
        markup = this.renderDesktop();
      } else {
        markup = this.renderSize();
      }
    }

    return markup;
  }

  renderSize() {
    let _this = this;
    let renderOrder = ['desktop', 'lg', 'md', 'sm', 'xs', 'mobile'];
    let startingPoint = renderOrder.indexOf(this.props.windowSize);
    let availableSizes = renderOrder.slice(startingPoint, renderOrder.length);
    /* search down the line for the first available render method*/
    let size = _.find(availableSizes, (size) => {
      return _this['render'+methodMap[size]];
    });

    let markup;
    if (!size) {
      /* try searching up the line */
      availableSizes = _.reverse(renderOrder.slice(0, startingPoint));
      size = _.find(availableSizes, (size) => {
        return _this['render'+methodMap[size]];
      });

      if (!size) {
        markup = (<div>This component does not implement responsive render methods</div>);
      }
    } else {
      markup = this['render'+methodMap[size]]();
    }

    return markup;
  }

}
