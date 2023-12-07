'use strict';

const axios = require('axios');
const wretch = require('wretch')

exports.getMeDogs = (endpoint) => {
  const url = endpoint.url;

  return axios
    .request({
      method: 'GET',
      baseURL: url,
      url: '/dogs',
      headers: { Accept: 'application/json' },
    })
    .then((response) => response.data);
};

exports.getMeDogsWretch = (endpoint) => {
    const url = endpoint.url;

    return wretch(url).headers({ Accept: 'application/json' }).get('/dogs').json(response => response).catch(e => {
        console.log("Error", e)
        throw e
    })
}

exports.getMeCats = (endpoint) => {
  const url = endpoint.url;

  return axios
    .request({
      method: 'GET',
      baseURL: url,
      url: '/cats?catId[]=2&catId[]=3',
      headers: { Accept: 'application/json' },
    })
    .then((response) => response.data);
};