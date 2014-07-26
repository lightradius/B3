define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'dust',
  'dust.marionette',
  'controllers/event-bus',
  'controllers/navigator',
  'views/comment-view',
  'views/reply-form-view',
  'views/replyable-view',
  // Shims:
  'content/content-template',
  'content/type-post-template',
  'content/type-page-template'
], function ($, _, Backbone, Marionette, dust, dustMarionette, EventBus, Navigator, CommentView, ReplyFormView, ReplyableView) {
  'use strict';

  var view = _.extend(ReplyableView, {
    template:  'content/content-template.dust',
    childView: CommentView,
    tagName: 'div id="post"',
    events: {
      'click .b3-reply-post':             'renderReplyBox', // from ReplyableView
      'click .b3-pager-next':             'renderNextPage',
      'click .b3-pager-previous':         'renderPrevPage',
      'click .b3-pagination .next a':     'renderNextPage',
      'click .b3-pagination .previous a': 'renderPrevPage',
      'click .b3-pagination .number a':   'renderPageNumber'
    },

    initialize: function (options) {
      this.model.fetchComments({
        done: function (data) { this.collection.add(data.models); }.bind(this),
        fail: function () { this.displayError(); }.bind(this)
      });

      this.page    = parseInt(options.page) || 1;
      this.content = this.model.get('content').split(/<!--nextpage-->/);
      this.post    = this.model;
      this.user    = options.user;

      _.bindAll(this, 'addComment');
      EventBus.bind('comment:created', this.addComment);
    },

    addComment: function (comment) {
      this.collection.add(comment);
      this.collection.sort();
      this.render();
    },

    parentId: function () {
      return 0;
    },

    serializeData: function () {
      return _.extend(this.parseModel(), this.getDustTemplate());
    },

    onDestroy: function () {
      if (this.replyBoxRendered) {
        this.replyBox.destroy();
      }

      EventBus.unbind('comment:created', this.addComment);
    },

    attachHtml: function (collectionView, itemView, index) {
      itemView.post = this.post;
      itemView.user = this.user;

      if (itemView.model.get('parent') > 0) {
        collectionView.$('#comment-' + itemView.model.get('parent') + ' > .comment-body > ul.b3-comments').append(itemView.el);
      } else {
        var commentSection = collectionView.$('.b3-comments');
        $(commentSection[0]).append(itemView.el);
      }
    },

    renderNextPage: function (event) {
      event.preventDefault();

      if (this.hasNext()) {
        this.page++;
        this.render();
        this.navigate();
      }
    },

    renderPrevPage: function (event) {
      event.preventDefault();

      if (this.hasPrevious()) {
        this.page--;
        this.render();
        this.navigate();
      }
    },

    renderPageNumber: function (event) {
      event.preventDefault();

      if (this.page !== event.target.dataset.page) {
        this.page = event.target.dataset.page;
        this.render();
        this.navigate();
      }
    },

    displayError: function () {
      this.$('.b3-comments').text('Could not retrieve comments');
    },

    parseModel: function () {
      var model = this.model.toJSON();
      model.content = this.content[this.page - 1];
      return _.extend(model, this.getPagination());
    },

    getPagination: function () {
      var vm = this;

      return {
        'has_next':     this.hasNext(),
        'has_previous': this.hasPrevious(),
        'pages':        this.content.length,

        'pageIterator': function (chunk, context, bodies) {
          var pages = context.current();

          for (var page = 1; page <= pages; page++) {
            chunk = chunk.render(bodies.block, context.push({
              'page':    page,
              'url':     vm.getRoute(page),
              'current': parseInt(page) === parseInt(vm.page)
            }));
          }

          return chunk;
        }
      };
    },

    /**
     * [getDustTemplate description]
     * @return {[type]} [description]
     */
    getDustTemplate: function () {
      var template = 'content/type-post-template.dust';
      var type     = this.post.get('type');

      if (config.paths['content/type-' + type + '-template']) {
        template = 'content/type-' + type + '-template.dust';
      }

      return { 'parent-template': template };
    },

    hasNext: function () {
      var total = this.content.length;
      return (total > 1 && this.page < total);
    },

    hasPrevious: function () {
      return this.page > 1;
    },

    getRoute: function (page) {
      var route = '/post/' + this.model.get('slug');
      if (page > 1) {
        route += '/page/' +  page;
      }
      return route;
    },

    navigate: function () {
      var route = this.getRoute(this.page);
      Navigator.navigate(route, false);
    }
  });

  var ContentSingleView = Backbone.Marionette.CompositeView.extend(view);
  return ContentSingleView;
});
