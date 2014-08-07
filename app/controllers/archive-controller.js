/* global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'helpers/post-filter',
  'collections/post-collection',
  'controllers/base-controller',
  'controllers/bus/event-bus',
  'controllers/navigation/navigator',
  'views/archive-view'
], function ($, _, Backbone, Marionette, PostFilter, Posts, BaseController, EventBus, Navigator, ArchiveView) {
  'use strict';

  return BaseController.extend({
    postInitialize: function (options) {
      this.page   = options.page || 1;
      this.filter = options.filter || new PostFilter();
      this._bindToArchiveEvents();
      this._bindToSearchEvents();
    },

    /**
     * Binds to a set of events
     */
    _bindToArchiveEvents: function () {
      _.bindAll(this, 'showPostByCategory', 'showPostByTag', 'showPostByAuthor', 'showPreviousPage', 'showNextPage');
      EventBus.bind('archive:display:category', this.showPostByCategory);
      EventBus.bind('archive:display:tag', this.showPostByTag);
      EventBus.bind('archive:display:author', this.showPostByAuthor);
      EventBus.bind('archive:display:previous:page', this.showPreviousPage);
      EventBus.bind('archive:display:next:page', this.showNextPage);
    },

    _bindToSearchEvents: function () {
      _.bindAll(this, 'saveCurrentState', 'loadPreviousState', 'displayResults');
      EventBus.bind('search:start', this.saveCurrentState);
      EventBus.bind('search:stop', this.loadPreviousState);
      EventBus.bind('search:results:found', this.displayResults);
      EventBus.bind('search:results:not_found', this.displayResults);
    },

    /**
     * Display the home page.
     */
    showHome: function (params) {
      // TODO: Display either a post list or a page according to WordPress'
      // home page settings (full post list vs page ID):

      this.showArchive(params);
    },

    /**
     * Display the home page post archive.
     *
     * @param {int} page Page number.
     */
    showArchive: function (params) {
      this.page = params.paged || 1;
      this.filter = new PostFilter();
      this._fetchPostsOfPage(this.page);
    },

    /**
     * Display posts of a given category
     *
     * @param  {string} category Category name
     * @param  {int}    page     Page number
     */
    showPostByCategory: function (params) {
      var category = params.category || params.id,
          slug     = params.category || params.slug;

      this.page   = params.paged || 1;
      this.filter = new PostFilter();
      this.filter = isNaN(category) ? this.filter.byCategory(category)
                                    : this.filter.byCategoryId(category);

      this._fetchPostsOfPage(this.page);
      Navigator.navigateToCategory(slug, this.page, false);
    },

    /**
     * Display posts of a given tag
     *
     * @param  {string} tag  Tag name
     * @param  {int}    page Page number
     */
    showPostByTag: function (params) {
      var tag    = params.post_tag || params.id,
          slug   = params.post_tag || params.slug;

      this.page   = params.paged || 1;
      this.filter = new PostFilter();
      this.filter = isNaN(tag) ? this.filter.byTag(tag)
                               : this.filter.byTagId(tag);

      this._fetchPostsOfPage(this.page);
      Navigator.navigateToTag(slug, this.page, false);
    },

    /**
     * Display posts of a given author
     *
     * @param  {string} author Author name
     * @param  {int}    page   Page number
     */
    showPostByAuthor: function (params) {
      var author = params.author || params.id,
          slug   = params.author || params.slug;

      this.page   = params.paged || 1;
      this.filter = new PostFilter();
      this.filter = isNaN(author) ? this.filter.byAuthor(author)
                                  : this.filter.byAuthorId(author);

      this._fetchPostsOfPage(this.page);
      Navigator.navigateToAuthor(slug, this.page, false);
    },

    /**
     * Display the next page
     */
    showNextPage: function () {
      if (!this._isLastPage()) {
        this.page++;
        this._displayPage(this.page);
      }
    },

    /**
     * Display the previous page
     */
    showPreviousPage: function () {
      if (!this._isFirstPage()) {
        this.page--;
        this._displayPage(this.page);
      }
    },

    /**
     * Navigates to a given post
     * @param  {Object} params The object containing the post
     */
    onShowPost: function (params) {
      Navigator.navigateToPost(params.post, null, true);
    },

    /**
     * Saves the current state (posts, page and filter)
     */
    saveCurrentState: function () {
      this.state = {
        collection:     this.posts,
        page:           this.page,
        filter:         this.filter,
        was_displaying: this.isDisplaying
      };
    },

    /**
     * Loads the previously saved state
     */
    loadPreviousState: function () {
      if (this.state.was_displaying) {
        this.posts  = this.state.collection;
        this.page   = this.state.page || 1;
        this.filter = this.state.filter;
        this.show(this._archiveView(this.posts, this.page));
      }
    },

    /**
     * Displays the given results
     */
    displayResults: function (params) {
      if (params) {
        this.posts  = params.results;
        this.filter = params.filter;
        this.page   = 1;
        this.show(this._archiveView(this.posts, this.page));
      } else {
        this.show(this.notFoundView());
      }
    },

    /**
     * Display a given page
     */
    _displayPage: function (page) {
      var route = Navigator.getPagedRoute(this.filter, page);
      this._fetchPostsOfPage(page);
      Navigator.navigate(route, false);
    },

    /**
     * Fetch all posts using a set of filters and display the
     * corresponding view on success or fail.
     */
    _fetchPostsOfPage: function (page) {
      this.posts = new Posts();
      this.filter.onPage(page);
      this.showLoading({region: this.app.main});
      this.posts.fetch(this._fetchParams())
          .done(function () { this.show(this._archiveView(this.posts, page)); }.bind(this))
          .fail(function () { this.show(this.notFoundView()); }.bind(this));
    },

    /**
     * Return the fetch parameters for a collection
     * @param  {PostFilter} filter The filters to use in the fetching
     * @return {Object}            The parameters to be used in the collection
     */
    _fetchParams: function () {
      return { reset: true, data: this.filter.serialize() };
    },

    /**
     * Indicates if it is last page or not
     * @return {boolean} true if it is last page, false otherwise
     */
    _isLastPage: function () {
      return this.posts.length === 0;
    },

    /**
     * Indicates if it is the first page or not
     * @return {boolean} true if it is the first page, false otherwise
     */
    _isFirstPage: function () {
      return this.page === 1;
    },

    /**
     * Creates a new ArchiveView instance for a post list.
     *
     * @param  {array}       posts Post collection to display.
     * @param  {int}         page  Page number.
     * @return {ArchiveView}       New archive view instance.
     */
    _archiveView: function (posts, page) {
      return new ArchiveView({collection: posts, page: page});
    }
  });
});