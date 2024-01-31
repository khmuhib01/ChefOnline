import axios from 'axios';
export default function getData(url) {
  return axios({
    method: 'GET',
    url: url,
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-host': 'smartrestaurantsolutions.com',
      'x-rapidapi-key': process.env.REACT_APP_API_KEY,
    },
    params: {
      language_code: 'en',
    },
  });
  // return axios.get(url);
}
