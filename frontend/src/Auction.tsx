import React, { Component } from 'react'
import { Socket } from 'socket.io-client'

const Link = require('react-router-dom').Link

class Auction extends Component<
  { socket: Socket },
  { bid: number; currentBid: number; itemId: number }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      bid: 0,
      currentBid: 69,
      itemId: +(window.location.pathname.split('/').pop() ?? 0),
    }
  }

  sendBid(socket: Socket) {
    socket.emit('bid', {
      userId: 123,
      itemId: this.state.itemId,
      bid: this.state.bid,
    })
  }

  render() {
    return (
      <div className="browse">
        <h1 className="browse-header">Wig item number {this.state.itemId}</h1>
        <h3>Current price: {this.state.currentBid}$</h3>
        <p>Item description</p>
        <div>
          <p>place your bid:</p>
          <input
            onChange={(event) => this.setState({ bid: +event.target.value })}
            type="number"
            value={this.state.bid}
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
