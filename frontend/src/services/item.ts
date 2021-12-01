import axios from 'axios';

const url = `http://localhost:3001/item`

const getItems = async () => {
  const response = await axios.get(url)
  return response.data
}

const addItem = async () => {
  const body = {
    seller: 'randomBaldGuy',
    buyer: 'evenMoreBaldGuy',
    name: 'Wiggly jiggly wig',
    description: 'This wig is most wiggy thing on earth',
    startAmount: 0,
  }
  const request = await axios.post(url, body)
  return request.data
}


export default { getItems, addItem }