import axios from 'axios';

import { ENDPOINT } from '../util';

const url = `${ENDPOINT()}/api/user`

const getUsers = async () => {
  const response = await axios.get(url)
  return response.data
}

const addUser = async (username: string, pwd: string) => {
  const user = {
    username,
    pwd
  }

  const response = await axios.post(url, user)
  return response.data
}

const login = async (username: string, pwd: string) => {
  try {
    const user = {
      username,
      pwd
    }

    const response = await axios.post(`${url}/login`, user)
    return response.data
  } catch (error: any) {
    console.log(error.response)
    return error.response.status
  }
}

export default { getUsers, addUser, login }