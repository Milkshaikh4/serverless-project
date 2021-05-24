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

    this.view.bind('view-add-post-model', () =>
      that.view.render('view-add-post-model'),
    );

    this.view.bind('submit-create-post', (e) => {
      that.handleSubmitCreatePost(e);
    });

    this.view.registerEventAction('togglePopover', (popperInstance, tooltip) =>
      that.togglePopover(popperInstance, tooltip),
    );

    this.view.registerEventAction('delete', (id) => that.handleDelete(id));
  }

  /**
   * * * * * * * * * * * *
   *    UI Services      *
   * * * * * * * * * * * *
   */

  Controller.prototype.togglePopover = function (popperInstance, tooltip) {
    const { show = null } = tooltip.dataset;

    const hidePopover = () => {
      tooltip.removeAttribute('data-show');

      popperInstance.setOptions({
        modifiers: [{ name: 'eventListeners', enabled: false }],
      });
    };

    const showPopver = () => {
      tooltip.setAttribute('data-show', '');

      popperInstance.setOptions({
        modifiers: [{ name: 'eventListeners', enabled: true }],
      });

      // Update its position
      popperInstance.update();
    };

    if (show !== null) {
      hidePopover();
    } else {
      showPopver();
    }
  };

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
    return this.api.delete({ id });
  };

  /**
   * * * * * * * * * * * *
   *    User Services    *
   * * * * * * * * * * * *
   */

  Controller.prototype.handleDelete = function (id) {
    if (typeof id !== 'string') {
      console.warn('Invalid id string', id);
      return;
    }

    console.log(`deleting ${id}`);

    this.deletePost(id).then((res) => console.log(res));
  };

  Controller.prototype.getFeed = function () {
    console.log('fetch posts');

    const render = (items) => {
      this.view.render('feed', {
        displayPosts: this._toDisplayPostObjList(items),
      });
    };

    // const _state = this.model.getState();

    // const _posts = _state?.feed?.posts;

    // if (_posts) {
    //   console.log('Found posts in local storage');
    //   render(_posts);
    //   return;
    // }

    this.listAll()
      .then((res) => {
        console.log('fetch posts res', res);
        const { Items } = res.posts;

        this.model.setState((state) => {
          state.feed.posts = Items;
          return state;
        });

        render(Items);
      });
  };

  /**
   * * * * * * * * * * * *
   *    Handle Forms     *
   * * * * * * * * * * * *
   */

  Controller.prototype._fileToData64 = (element) =>
    new Promise((resolve) => {
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

  Controller.prototype.reset = function (dataURL) {
    const list = qsa('li[id="post"] #post-image');

    list.forEach((elem) => {
      elem.src = dataURL;
    });
  };

  // Export to window
  window.app = window.app || {};
  window.reset = Controller.prototype.reset;
  window.app.Controller = Controller;
}(window));
