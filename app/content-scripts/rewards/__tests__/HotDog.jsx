import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import HotDog from '../HotDog';

global.t = function (str) {
	return str;
};
