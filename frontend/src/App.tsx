
import logo from './logo.svg';
import './App.css';

import React, { Component } from 'react';
import Browse from './Browse';
import Auction from './Auction';

import { BrowserRouter, Routes, Route } from "react-router-dom";

export const App = () => {
	return (
		<div className='container'>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Browse />} />
					<Route path="auction/:aid" element={<Auction />} />
				</Routes>
			</BrowserRouter>
			<Footer />
		</div>
	)
}

function Footer(_props: any) {
	return (
		<footer>&copy; 2021 Team WARM </footer>
	)
}
