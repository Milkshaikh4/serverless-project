(function (window) {
  /**
   *
   * This is a sample class API which you may base your code on.
   * You may use this as a launch pad but do not have to.
   * @param {String} url */
  function API(url) {
    this.env = {
      post:
        'https://iavsfwfbo7.execute-api.ap-southeast-2.amazonaws.com/dev/post',
      get:
        'https://iavsfwfbo7.execute-api.ap-southeast-2.amazonaws.com/dev/post',
      delete:
        'https://iavsfwfbo7.execute-api.ap-southeast-2.amazonaws.com/dev/post',
      update: '',
    };
    this.url = url;
  }

  API.prototype.encodeParams = function (params) {
    return `?${Object.entries(params)
      .map((kv) => kv.join('='))
      .join('&')}`;
  };

  API.prototype._request = function (path, options) {
    return fetch(path, options)
      .catch((err) => console.warn(err));
  };

  /**
   * Create Post request - returns a promise
   *
   * @param {String} path The relative path to the lambda API gateway
   * @param {Obj} data Data as a json obj
   * */
  API.prototype.post = function (data) {
    if (!data?.descr || !data?.img) return null;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };

    console.log(data);

    return this._request(this.env.post, options);
  };

  /**
   * Get request
   *
   * @param {String} path The relative path to the api end point
   * @param {Obj} data Data as a json obj
   * */
  API.prototype.get = function () {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return this._request(this.env.get, options);
  };

  /**
   * Delete request
   *
   * @param {String} path The relative path to the api end point
   * @param {Obj} data Data as a json obj
   * */
  API.prototype.delete = function (params = {}) {
    const options = {
      method: 'delete',
      headers: {},
    };

    const path = this.env.delete + this.encodeParams(params);

    return this._request(path, options);
  };

  /**
   * PUT request
   *
   * @param {String} path The relative path to the api end point
   * @param {Obj} data Data as a json obj
   * */
  API.prototype.put = function (
    path,
    params = {},
    payload = {},
    token = false,
  ) {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    if (token) {
      options.headers.Authorization = `Token ${token}`;
    }

    return this._request(path, params, options);
  };

  /**
   * Make a request to `path` with `options` and parse the response as JSON.
   *
   * @param {*} path The url to make the request to.
   * @param {*} options Additional options to pass to fetch.
   */
  API.prototype.getJSON = function (path, options) {
    return fetch(path, options)
      .then((res) => res.json())
      .catch((err) => console.warn(`API_ERROR: ${err.message}`));
  };

  // Export to window
  // eslint-disable-next-line no-param-reassign
  window.app = window.app || {};
  // eslint-disable-next-line no-param-reassign
  window.app.API = API;
}(window));
