import React, { Component } from 'react'
import { Socket } from 'socket.io-client'

import { Item, User } from './Interfaces'

const Link = require('react-router-dom').Link

class Auction extends Component<
  { socket: Socket; items: Item[]; user: User | undefined; users: User[] },
  { newBidAmount: number; item: Item | undefined }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      newBidAmount: 0,
      item: undefined,
    }
  }

  async componentDidMount() {
    let itemId = window.location.pathname.split('/').pop() ?? '0'
    let item: Item | undefined = this.props.items.find(
      (item) => itemId == item._id
    )

    this.setState({
      newBidAmount: (item?.currentBid.amount ?? 0) + 1,
      item,
    })
  }

  componentDidUpdate(prevProps: any, _prevState: any) {
    if (prevProps !== this.props) {
      let itemId = window.location.pathname.split('/').pop() ?? '0'
      let item: Item | undefined = this.props.items.find(
        (item) => itemId == item._id
      )

      this.setState({
        newBidAmount: (item?.currentBid.amount ?? 0) + 1,
        item,
      })
    }
  }

  sendBid(socket: Socket) {
    if (this.props.user && this.state.item)
      socket.emit('bid', {
        userId: this.props.user._id,
        itemId: this.state.item._id,
        amount: this.state.newBidAmount,
      })
  }

  bidder() {
    const { item } = this.state
    const { users } = this.props
    const bidder = users.filter(
      (user: User) => user._id === item?.currentBid.userId
    )
    return bidder[0]
      ? `by ${bidder[0].username} (${
          item?.currentBid.timestamp
            ? new Date(item.currentBid.timestamp).toLocaleString()
            : ''
        })`
      : ''
  }

  seller() {
    const { item } = this.state
    const { users } = this.props
    const seller = users.filter((user: User) => user._id === item?.seller)
    return seller[0] ? seller[0].username : ''
  }

  getBidComponent() {
	const { item, newBidAmount } = this.state;
	
	if (item && new Date(item.buyTime) > new Date()) {
		return (
		  <>
			{this.props.user && (
			  <div>
				<h3>
				  Bidding ends at{' '}
				  {item?.buyTime
					? new Date(item.buyTime).toLocaleString()
					: 'Not specified'}
				</h3>
				<p>place your bid:</p>
				<input
				  onChange={(event) =>
					this.setState({ newBidAmount: +event.target.value })
				  }
				  type="number"
				  value={newBidAmount}
				></input>
				<button onClick={() => this.sendBid(this.props.socket)}>
				  Place bid
				</button>
			  </div>
			)}
		  </>
		)
	  } else {
		return (
		  <>
			<h3>
			  Bidding ended at{' '}
			  {item?.buyTime
				? new Date(item.buyTime).toLocaleString()
				: 'Not specified'}
			</h3>
		  </>
		)
	  }
  }

  render() {
    const { item, newBidAmount } = this.state;

    let BidComponent = this.getBidComponent();

    return (
      <div className="browse">
        <h1 className="browse-header">
          {item?.name} - {item?._id}
        </h1>
        <img
          src={'../' + (item?.imageUrl ? item.imageUrl : 'maldnet_4.png')}
          width="400px"
        ></img>
        <h2>Seller: {this.seller()}</h2>
        <h3>
          Current price: {item?.currentBid.amount}€ {this.bidder()}
        </h3>
        <p>{item?.description}</p>
        {BidComponent}
      </div>
    )
  }
}

export default Auction
