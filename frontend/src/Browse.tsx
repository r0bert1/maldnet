import React, { Component } from 'react';

const Link = require('react-router-dom').Link;

const bids = ['rockstar wig', 'kova peruukki', 'the malder', 'blondie']

const Browse = () => {
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
	  </div>
	)
}

export default Browse;
