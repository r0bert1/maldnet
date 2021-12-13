import './App.css'
import socketIOClient, { Socket } from 'socket.io-client'

import React, { Component, useEffect, useState } from 'react'
import Browse from './Browse'
import Auction from './Auction'
import Login from './Login'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import itemService from './services/item'
import userService from './services/user'

import { Item, Bid, User } from './Interfaces'
import { ENDPOINT } from './util'


const socket = socketIOClient(ENDPOINT(), {
  withCredentials: false,
})

export const App = () => {
  const [items, setItems] = useState<Item[]>([])
  const [user, setUser] = useState<User>()
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    itemService.getItems().then(setItems)
    userService.getUsers().then(setUsers)
    const userFromStorage = window.localStorage.getItem('user')
    if (userFromStorage) {
      const user = JSON.parse(userFromStorage)
      setUser(user)
    }
  }, [])

  const updateCurrentBid = (item: Item, bid: Bid) => {
    if (item._id === bid.itemId)
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
      <Login setUser={setUser} user={user} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Browse items={items} user={user} users={users} />} />
          <Route
            path="auction/:aid"
            element={<Auction socket={socket} items={items} user={user} users={users}/>}
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
