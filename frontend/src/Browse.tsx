import React, { useState } from 'react';
import itemService from './services/item'

import { Item, User } from './Interfaces'
import ItemForm from './ItemForm'

const Link = require('react-router-dom').Link;

const Browse = (props: any) => {
	const [showAddItem, setShowAddItem] = useState<Boolean>(false)
	let items: Item[] = props.items;

	const handleAddClick = () => {
		setShowAddItem(true)
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
			<div className='grid-container'>
				{items.map((item) => (
					<>
						<div className='grid-item' key={item._id + '_info'}>
							<h2><Link to={"auction/" + item._id}>{item.name}</Link></h2>
							<p>{item.description}</p>
							<b><span>{item.currentBid.amount}</span>€</b>
							<p>{bidder(item.currentBid.userId)}</p>
						</div>
						<div className='grid-item' key={item._id + '_preview'}>
							<img src={item.imageUrl ? item.imageUrl : 'maldnet_4.png'} width="200px"></img>
						</div>
					</>
				))}
			</div>
			{props.user && <div>
				<h3>Got some old hair? Gib us!</h3>
				<button onClick={() => handleAddClick()}>Add wig</button>
			</div>}
			{showAddItem &&
				<ItemForm setShowAddItem={setShowAddItem} user={props.user} setItems={props.setItems}/>
			}

		</div>
	)
}

export default Browse;
