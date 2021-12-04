import React, { Component } from 'react'
import { Socket } from 'socket.io-client'

import { Item } from './Interfaces'
import itemService from './services/item'

const Link = require('react-router-dom').Link

class Auction extends Component<
  { socket: Socket },
  { newBidAmount: number; item: Item | undefined }
> {
  constructor(props: any) {
	super(props)
	this.state = {
	  newBidAmount: 0,
	  item: undefined
	}
  }

  async componentDidMount() {
	let itemId = window.location.pathname.split('/').pop() ?? "0";
	let item: Item = await itemService.getItem(itemId);

	item.currentBid = {
		itemId: item.id,
		userId: 'TODO',
		amount: item.startAmount,
		timestamp: new Date()
	};
	
	this.setState({
		newBidAmount: item.currentBid.amount + 1,
		item
	});
  }

  sendBid(socket: Socket) {
	socket.emit('bid', {
	  userId: "123",
	  itemId: this.state.item?.id,
	  amount: this.state.newBidAmount,
	})
  }

  render() {
	  const { item, newBidAmount } = this.state
	return (
	  <div className="browse">
		<h1 className="browse-header">{item?.name} - {item?.id}</h1>
		<h3>Current price: {item?.currentBid.amount}$</h3>
		<p>{item?.description}</p>
		<div>
		  <p>place your bid:</p>
		  <input
			onChange={(event) => this.setState({ newBidAmount: +event.target.value })}
			type="number"
			value={newBidAmount}
		  ></input>
		  <button onClick={() => this.sendBid(this.props.socket)}>
			Place bid
		  </button>
		</div>
	  </div>
	)
  }
}

export default Auction
