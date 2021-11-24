
import logo from './logo.svg';
import './App.css';

import React, { Component } from 'react';
import Browse from './Browse';
import Auction from './Auction';

const ReactRouter = require('react-router-dom');
const Router = ReactRouter.BrowserRouter;
const Route = ReactRouter.Route;
const Switch = ReactRouter.Switch;

export const App = () => {
	return (
		<>
			<Browse />
		</>
	)
}

function Footer(_props: any) {
  return (
    <footer>&copy; 2021 Team WARM </footer>
  )
}
