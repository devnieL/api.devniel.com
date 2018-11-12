require('dotenv').config()

import path from 'path';
import Engine from './Engine';

/**
 * Omn Blog Example
 * @author : Daniel (devnieL) Flores
*/

global.version = "0.0.1";
global.rootDirectory = path.resolve(__dirname);

// Engine setup

Engine.setup({
	db: {
			type : "mongodb",
			uri: process.env.MONGODB_URL
	}
});

Engine.start();
