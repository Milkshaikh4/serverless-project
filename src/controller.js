/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
(function (window) {
  /**
   * Takes an api ref and view and acts as the controller
   *
   * @constructor
   * @param {object} view The view instance
   */

  function Controller(view, model) {
    const that = this;
    this.view = view;
    // eslint-disable-next-line no-undef
    this.api = new app.API('http://127.0.0.1:5000/');
    this.model = model;

    this.view.bind('view-add-post-model', () => that.view.render('view-add-post-model'));

    this.view.bind('submit-create-post', (e) => {
      that.handleSubmitCreatePost(e);
    });
  }

  /**
   * * * * * * * * * * * *
   *    Post Services    *
   * * * * * * * * * * * *
   */

  Controller.prototype._toDisplayPostObjList = function (posts) {
    return posts.map((post) => ({
      id: post.id,
      src: post.img,
      displayDate: timestampeToDate(post.createdAt),
      descr: post.descr,
    }));
  };

  Controller.prototype.createPost = function (payload) {
    return this.api.post(payload);
  };

  Controller.prototype.listAll = function () {
    return this.api.get();
  };

  Controller.prototype._editPost = function (id, payload, token) {
    return this.api.put('post/', { id }, payload, token);
  };

  Controller.prototype.deletePost = function (id) {
    return this.api.delete('post/', { id });
  };

  /**
   * * * * * * * * * * * *
   *    User Services    *
   * * * * * * * * * * * *
   */

  Controller.prototype._getUserFeed = function (p = 0, n = 5) {
    const token = this.auth();
    if (!token) return null;

    this.model.setState((state) => {
      state.scroll.loading = true;
      return state;
    });

    return this.api
      .get('user/feed', { p, n }, token)
      .then((data) => {
        this.model.setState((state) => {
          state.scroll.loading = false;
          state.scroll.p += data.posts.length;
          return state;
        });

        const state = this.model.getState();

        return data;
      })
      .catch((err) => {
        console.warn(err);
        const _state = this.model.getState();

        if (_state.feed.posts !== null) {
          return this._toDisplayPostObjList(_state.feed.posts);
        }

        return [{}];
      });
  };

  /**
   * * * * * * * * * * * *
   *    Handle Forms     *
   * * * * * * * * * * * *
   */

  Controller.prototype._fileToData64 = (element) => new Promise((resolve) => {
    const file = element.files[0];
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

  Controller.prototype.handleSubmitCreatePost = function (e) {
    if (e) e.preventDefault();

    const form = qs('form[id="create-post"]');
    const descr = qs('#descr', form).value;
    const image = qs('#src', form);

    this._fileToData64(image).then((img) => {
      const payload = { descr, img };
      this.createPost(payload);
    });
  };

  Controller.prototype.handleEditPost = function (e) {
    if (e) e.preventDefault();

    const form = e.target;
    const lengthR = new RegExp('.{2,50}');
    const descr = qs('#descr', form);

    if (!lengthR.test(descr.value)) {
      this.view.render('signupLengthError'); // TODO
    }

    // TODO
  };

  Controller.prototype.editPost = function (e) {
    if (e) e.preventDefault();

    const form = e.target;
    const descr = qs('#descr', form).value;
    const image = qs('#src', form);

    const { id } = parent(form, 'LI').dataset;

    const r = new RegExp('^.*base64,(.*)$');

    this._fileToData64(image).then((src) => {
      const matches = r.exec(src);
      const payload = { description_text: descr, src: matches[1] };
      this._editPost(id, payload, token).then(() => {
        this.goToProfile();
      });
    });
  };

  // ------

  Controller.prototype.getFeed = function () {
    console.log("fetch posts")

    this.listAll().then((res) => res.json())
      .then((res) => {
        const { posts } = res;
        console.log("recieved posts", posts)

        this.view.render('feed', {
          displayPosts: this._toDisplayPostObjList(posts.Items),
        });
      });
  };

  Controller.prototype.getMorePosts = function () {
    const token = this.auth();
    if (!token) return;

    const state = this.model.getState();
    let posts = state.feed.posts.length ? [...state.feed.posts] : [];

    const { p, n, loading } = state.scroll;

    if (loading) return;

    this._getUserFeed(p, n).then((data) => {
      const newPosts = this._postsToInitialState(data.posts);
      posts = posts.concat(newPosts);

      this.model.setState((_state) => {
        _state.feed.posts = [...posts];
        return _state;
      });

      const displayPosts = this._toDisplayPostObjList(posts);

      if (!displayPosts) return;
      this.view.render('to-feed', { displayPosts });
    });
  };

  Controller.prototype.reset = function (dataURL) {
    const list = qsa('li[id="post"] #post-image');

    list.forEach(elem => {
      elem.src = dataURL;
    })
  }

  // Export to window
  window.app = window.app || {};
  window.reset = Controller.prototype.reset; 
  window.app.Controller = Controller;
}(window));
