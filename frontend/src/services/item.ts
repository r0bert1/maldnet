import axios from 'axios';

const ENDPOINT =
  process.env.NODE_ENV === 'production'
    ? window.location.port
    : +window.location.port - 1

const url = `http://localhost:${ENDPOINT}/api/item`

const getItems = async () => {
  const response = await axios.get(url)
  return response.data
}

const getItem = async (id: string) => {
  const response = await axios.get(url + '/' + id)
  return response.data
}

const addItem = async () => {
  const item = {
    seller: 'randomBaldGuy',
    name: 'Wiggly jiggly wig',
    description: 'This wig is most wiggy thing on earth',
    startAmount: 0,
  }

  const response = await axios.post(url, item)
  return response.data
}


export default { getItems, getItem, addItem }