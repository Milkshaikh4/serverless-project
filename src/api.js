(function (window) {
  /**
   *
   * This is a sample class API which you may base your code on.
   * You may use this as a launch pad but do not have to.
   * @param {String} url */
  function API(url) {
    this.url = url;
  }

  API.prototype.encodeParams = function (params) {
    return (
      "?" +
      Object.entries(params)
        .map((kv) => kv.join("="))
        .join("&")
    );
  };

  API.prototype._request = function (path, params, options) {
    return fetch(`${this.url}${path}${this.encodeParams(params)}`, options)
      .then((res) => res.json())
      .catch((err) => console.warn(`API_ERROR: ${err.message}`));
  };

  /**
   * Post request - returns a promise
   *
   * @param {String} path The relative path to the api end point
   * @param {Obj} data Data as a json obj
   * */
  API.prototype.post = function (path, data = {}, token = false) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    if (token) {
      options.headers.Authorization = "Token " + token;
    }

    return this._request(path, {}, options);
  };

  /**
   * Get request
   *
   * @param {String} path The relative path to the api end point
   * @param {Obj} data Data as a json obj
   * */
  API.prototype.get = function (path, params = {}, token = false) {
    let options = {
      method: "GET",
      headers: {},
    };

    if (token) {
      options.headers.Authorization = "Token " + token;
    }

    return this._request(path, params, options);
  };

  /**
   * Delete request
   *
   * @param {String} path The relative path to the api end point
   * @param {Obj} data Data as a json obj
   * */
  API.prototype.delete = function (path, params = {}, token = false) {
    let options = {
      method: "delete",
      headers: {},
    };

    if (token) {
      options.headers.Authorization = "Token " + token;
    }

    return this._request(path, params, options);
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
    token = false
  ) {
    let options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    if (token) {
      options.headers.Authorization = "Token " + token;
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
  window.app = window.app || {};
  window.app.API = API;
})(window);
