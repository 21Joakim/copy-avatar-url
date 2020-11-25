const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree, getOwnerInstance } = require('powercord/util');

const { ASSET_ENDPOINT } = window.GLOBAL_ENV;
const { clipboard } = require('electron');

module.exports = class CopyAvatarURL extends Plugin {
  async startPlugin () {
    const Menu = await getModule([ 'MenuItem' ]);
    inject('jockie-copyAvatarUrl-user', Menu, 'default', (args) => {
      const [ { navId, children } ] = args;
      if (navId !== 'user-context') {
        return args;
      }

      const hasAvatarUrlItem = findInReactTree(children, child => child.props && child.props.id === 'copy-avatar-url');
      if (!hasAvatarUrlItem) {
        let user;

        if (document.querySelector('#user-context')) {
          const instance = getOwnerInstance(document.querySelector('#user-context'));
          ({ user } = instance._reactInternals.return.memoizedProps);
        }

        const copyAvatarUrlItem = React.createElement(Menu.MenuItem, {
          id: 'copy-avatar-url',
          label: 'Copy Avatar URL',
          action: () => clipboard.writeText(`${!user.avatar ? ASSET_ENDPOINT : ''}${user.avatarURL}`)
        });

        const devmodeItem = findInReactTree(children, child => child.props && child.props.id === 'devmode-copy-id');
        const developerGroup = children.find(child => child.props && child.props.children === devmodeItem);
        if (developerGroup) {
          if (!Array.isArray(developerGroup.props.children)) {
            developerGroup.props.children = [ developerGroup.props.children ];
          }

          developerGroup.props.children.push(copyAvatarUrlItem);
        } else {
          children.push([ React.createElement(Menu.MenuSeparator), React.createElement(Menu.MenuGroup, {}, copyAvatarUrlItem) ]);
        }
      }

      return args;
    }, true);

    Menu.default.displayName = 'Menu';
  }

  pluginWillUnload () {
    uninject('jockie-copyAvatarUrl-user');
  }
};
