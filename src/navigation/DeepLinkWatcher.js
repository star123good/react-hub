// @flow

import React from 'react';
import { Linking } from 'react-native';

import { clearAppData } from '../sagas';
import { githubHTMLUrlFromAPIUrl } from '../utils/helpers';

export default class extends React.PureComponent {
  componentDidMount() {
    Linking.addEventListener('url', this._handleOpenURL)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleOpenURL);
  }

  _handleGitHubURL = (url) => {
    if (!url) return;

    let _url = url.replace('devhub://', 'https://');
    _url = _url.indexOf('api.github.com') >= 0 ? githubHTMLUrlFromAPIUrl(_url) : _url;

    if (_url.indexOf('http') !== 0) _url = `https://${_url}`;

    return Linking.openURL(_url);
  };

  _handleDeepLinking(url) {
    if (!url) return;

    if (url === 'reset') {
      clearAppData();
    } else {
      Linking.openURL(url);
    }
  }

  _handleOpenURL = (event) => {
    const url = event.url.match("[^:]+://(.*)")[1];
    if (!url) return;

    if (url.indexOf('github.com') >= 0) {
      return this._handleGitHubURL(url);
    }

    return this._handleDeepLinking(url);
  };

  props: {
    children?: any,
  };

  render() {
    return this.props.children;
  }
}
