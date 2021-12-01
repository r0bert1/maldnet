import React, { Component } from 'react';
import itemService from './services/item'

const Link = require('react-router-dom').Link;

const bids = ['rockstar wig', 'kova peruukki', 'the malder', 'blondie']

const Browse = () => {

	const handleAddClick = () => {
		itemService.addItem()
	}

	return (
		<div className='browse'>
			<h1 className='browse-header'>Mald.fi</h1>
			<p>You got bald? Don't be mald, we got you!</p>
			<h2>Current bids:</h2>
			<ul>
				{bids.map((bid) => (
					<li>{bid}</li>
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
