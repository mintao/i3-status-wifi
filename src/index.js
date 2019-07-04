'use strict';

import { EventEmitter } from 'events';
import wifi from 'node-wifi';
/* Available keys:
iface: '...', // network interface used for the connection, not available on macOS
ssid: '...',
bssid: '...',
mac: '...', // equals to bssid (for retrocompatibility)
channel: <number>,
frequency: <number>, // in MHz
signal_level: <number>, // in dB
quality: <number>, // same as signal level but in %
security: '...' //
security_flags: '...' // encryption protocols (format currently depending of the OS)
mode: '...' // network mode like Infra (format currently depending of the OS)
*/

export default class Text extends EventEmitter {
  constructor(options, output) {
    super();
    options = options || {};
    this.output = output || {};
	this.show = options.show || ['ssid'];
	this.showCounter = 0;
	this.connections = [];
    this.interface = options.interface || null;
    wifi.init({
	  iface : this.interface // network interface, choose a random wifi interface if set to null
    });
  }

  updateConnections() {
	this.__logger.debug('Is fetching?', this.isFetching());
	if (this.isFetching()) {
      this.__logger.debug('Fetching already in progress');
	  return;
	}
    this.blockFetching();
    wifi.getCurrentConnections((err, currentConnections) => {
      if (!err) {
        this.connections = currentConnections;
      }
      this.__logger.debug('Fetched %d connection', this.connections.length);
      this.unblockFetching();
    });
  }

  blockFetching() {
    this.fetching = true;
  }

  unblockFetching() {
    this.fetching = false;
  }

  isFetching() {
    return this.fetching === true;
  }

  update() {
	this.updateConnections();
	const fullTexts = [];
	const shortTexts = [];
	const show = this.show[this.showCounter];

	this.connections.forEach(connection => {
	  fullTexts.push(`${connection[show]}: ${connection.quality}%`);
	  shortTexts.push(connection[show]);
	});

    if (this.connections.length === 0) {
      const msg = `<${show}>: No connection`;
	  fullTexts.push(msg);
	  shortTexts.push(msg);
    }

	this.output.full_text = fullTexts.join(' | ');
	this.output.short_text = shortTexts.join(' | ');

	//emit updated event to i3Status
	this.emit('updated', this, this.output);
  }

  action(action) {
	this.__logger.debug('button pressed on %s:', this.__name, action.button);
	this.showCounter++;
	if (this.showCounter > this.show.length - 1) {
	  this.showCounter = 0;
	}
  }
}

