import React, { Component } from 'react';

const Link = require('react-router-dom').Link;

class Auction extends Component {
  render() {
    return (
      <div className='browse'>
        <h1 className='browse-header'>Wig item number 1337</h1>
        <p>No bidding for you!</p>
      </div>
    )
  }
}

export default Auction;
