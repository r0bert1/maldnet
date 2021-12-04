import React, { Component, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client'
import item from './services/item';
import itemService from './services/item'

const Link = require('react-router-dom').Link;

interface Item {
	id: string,
	name: string,
	description: string,
	startAmount: number,
	seller: string
}

const Browse = (props: any) => {
	let items: Item[] = props.items;
	let socket: Socket = props.socket;

	const [bids, setBids] = useState(new Map());

	useEffect(() => {
		let newBids = new Map();
		items.forEach((item) => newBids.set(item.id, item.startAmount))
		setBids(newBids)
	}, []);

	const handleAddClick = () => {
		itemService.addItem()
	}

	return (
		<div className='browse'>
			<h1 className='browse-header'>Mald.fi</h1>
			<p>You got bald? Don't be mald, we got you!</p>
			<h2>Current items:</h2>
			<ul>
				{items.map((item) => (
					<li key={item.id}>
						<h2>{item.name}</h2>
						<p>{item.description}</p>
						<b>🛸 <span>{bids.get(item.id) ?? item.startAmount}</span> 🛸</b>
					</li>
				))}
			</ul>
			<div>
				<h3>Got some old hair? Gib us!</h3>
				<button onClick={() => handleAddClick()}>Add wig</button>
			</div>
		</div>
	)
}

export default Browse;
