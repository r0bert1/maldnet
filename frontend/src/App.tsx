
import logo from './logo.svg';
import './App.css';
import socketIOClient from "socket.io-client";


import React, { Component, useEffect, useState } from 'react';
import Browse from './Browse';
import Auction from './Auction';

import { BrowserRouter, Routes, Route } from "react-router-dom";

export const App = () => {
	const [response, setResponse] = useState("");

	const ENDPOINT = "localhost:3001";
  
	useEffect(() => {
		const socket = socketIOClient(ENDPOINT, {
			withCredentials: true
		});
		socket.on("FromAPI", data => {
			setResponse(data);
		});
	}, []);

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
