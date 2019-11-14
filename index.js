const { Plugin } = require('powercord/entities');
const { getModuleByDisplayName, getModule, React } = require('powercord/webpack');
const { ContextMenu: { Button } } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');

const { clipboard } = require('electron');

module.exports = class CopyAvatarUrl extends Plugin {
  async import (filter, name = filter, useModule = false) {
    if (typeof filter === 'string') {
      filter = [ filter ];
    }

    if (useModule) {
      this[name] = await getModule(filter);
    } else {
      this[name] = (await getModule(filter))[name];
    }
  }

  async doImport () {
    await this.import('developerMode', 'settings', true);
  }

  async startPlugin () {
    await this.doImport();

    const _this = this;

    const UserContextMenu = await getModuleByDisplayName('UserContextMenu');
    inject('jockie-copyAvatarUrl-user', UserContextMenu.prototype, 'render', function (args, res) {
      const { children } = res.props.children.props.children.props;

      const developerGroupIndex = children.findIndex(item => item && item.type.displayName === 'DeveloperModeGroup');

      /* Backup in case it changes name */
      const foundComponent = developerGroupIndex !== -1;

      children.splice((foundComponent ? developerGroupIndex + 1 : children.length), 0, React.createElement(Button, {
        name: 'Copy Avatar Url',
        onClick: () => clipboard.writeText(this.props.user.avatarURL),
        seperate: !foundComponent || !_this.settings.developerMode
      }));

      return res;
    });
  }

  pluginWillUnload () {
    uninject('jockie-copyAvatarUrl-user');
  }
};
