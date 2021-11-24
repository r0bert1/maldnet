import React, { Component } from 'react';

const Link = require('react-router-dom').Link;

class Auction extends Component {
  render() {
    return (
      <div className='browse'>
        <h1 className='browse-header'>Wig item number 1337</h1>
        <h3>Current price: 69$</h3>
        <p>Item description</p>
        <div>
          <p>place your bid:</p>
          <input type="text" pattern="[0-9]*"></input>
          <button>Place bid</button>
          </div>
      </div>
    )
  }
}

export default Auction;
