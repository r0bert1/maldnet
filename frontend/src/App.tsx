import './App.css'
import socketIOClient, { Socket } from 'socket.io-client'

import React, { Component, useEffect, useState } from 'react'
import Browse from './Browse'
import Auction from './Auction'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import itemService from './services/item'

import { Item, Bid } from './Interfaces'

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? `localhost:${window.location.port}`
    : `localhost:${+window.location.port - 1}`

const socket = socketIOClient(ENDPOINT, {
  withCredentials: true,
})

export const App = () => {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    itemService.getItems().then((items) => {
      setItems(
        items.map((item: any) => ({
          ...item,
          currentBid: {
            itemId: item.id,
            userId: 'TODO',
            amount: item.startAmount,
            timestamp: null,
          },
        }))
      )
    })
  }, [])

  const updateCurrentBid = (item: Item, bid: Bid) => {
    if (item.id === bid.itemId)
      return {
        ...item,
        currentBid: bid,
      }
    return item
  }

  socket.off('bid')
  socket.on('bid', (bid) => {
    let newItems = items.map((item) => updateCurrentBid(item, bid))
    setItems(newItems)
  })

  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Browse items={items} />} />
          <Route
            path="auction/:aid"
            element={<Auction socket={socket} items={items} />}
          />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  )
}

function Footer(_props: any) {
  return <footer>&copy; 2021 Team WARM </footer>
}
