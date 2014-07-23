'use strict';

define([
  'jquery',
  'underscore',
  'marionette',
  'dust',
  'dust.marionette',
  'controllers/event-bus',
  'views/comment-view',
  'views/reply-form-view',
  'views/replyable-view',
  'content/content-template',
  'content/post-template'
], function ($, _, Marionette, dust, dustMarionette, EventBus, CommentView, ReplyFormView, ReplyableView) {
  var view = _.extend(ReplyableView, {
    template:  'content/content-template.dust',
    childView: CommentView,
    tagName: 'div id="post"',
    events: {
      'click .b3-reply-post':   'renderReplyBox', // from ReplyableView
      'click .pagination-next': 'renderNextPage',
      'click .pagination-prev': 'renderPrevPage'
    },

    initialize: function () {
      this.model.fetchComments({
        done: function (data) { this.collection.add(data.models); }.bind(this),
        fail: function () { this.displayError(); }.bind(this)
      });
      this.page    = 0;
      this.content = this.model.get('content').split(/<!--nextpage-->/);
      this.post    = this.model;
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
    },

    attachHtml: function (collectionView, itemView, index) {
      this.collection.models[index].post = this.post;

      if (itemView.model.get('parent') > 0) {
        collectionView.$('#comment-' + itemView.model.get('parent') + ' > ul.b3-comments').append(itemView.el);
      } else {
        var commentSection = collectionView.$('.b3-comments');
        $(commentSection[0]).append(itemView.el);
      }
    },

    renderNextPage: function () {
      if (this.page < this.content.length -1) {
        this.page++;
        this.render();
      }
    },

    renderPrevPage: function () {
      if (this.page > 0) {
        this.page--;
        this.render();
      }
    },

    displayError: function () {
      this.$('.b3-comments').text('Could not retrieve comments');
    },

    parseModel: function () {
      var model = this.model.toJSON();
      model.content = this.content[this.page];
      return _.extend(model, this.getPagination());
    },

    getPagination: function () {
      var total = this.content.length,
          next = (total > 1 && this.page < total - 1),
          prev = (this.page > 0);

      return {has_next: next, has_previous: prev};
    },

    getDustTemplate: function () {
      return {b3type: 'post', b3folder: 'content'};
    }
  });

  var ContentSingleView = Backbone.Marionette.CompositeView.extend(view);
  return ContentSingleView;
});