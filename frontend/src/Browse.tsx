import React, { useState } from 'react';
import itemService from './services/item'

import { Item, User } from './Interfaces'

const Link = require('react-router-dom').Link;

const Browse = (props: any) => {
	let items: Item[] = props.items;

	const handleAddClick = () => {
		itemService.addItem()
	}

	const bidder = (userid: string) => {
		const bidder = props.users.filter((user: User) => user._id === userid)
		return bidder[0] ? `Currently in lead: ${bidder[0].username}` : ''
	}

	return (
		<div className='browse'>
			<h1 className='browse-header'>Mald.fi</h1>
			<p>You got bald? Don't be mald, we got you!</p>
			<h2>Current items:</h2>
			<ul>
				{items.map((item) => (
					<li key={item._id}>
						<h2><Link to={"auction/" + item._id}>{item.name}</Link></h2>
						<p>{item.description}</p>
						<b>🛸 <span>{item.currentBid.amount}</span> 🛸</b>
						<p>{bidder(item.currentBid.userId)}</p>
					</li>
				))}
			</ul>
			{props.user && <div>
				<h3>Got some old hair? Gib us!</h3>
				<button onClick={() => handleAddClick()}>Add wig</button>
			</div>}

		</div>
	)
}

export default Browse;
