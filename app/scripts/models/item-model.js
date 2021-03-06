/* global define */

define([
  'jquery',
  'backbone'
], function ($, Backbone) {
  'use strict';
  var Item = Backbone.Model.extend({
    defaults: {
      ID:            null,
      object:        null,
      parent:        0,
      order:         0,
      object_parent: 0,
      type:          '',
      guid:          '',
      object_type:   '',
      link:          '',
      title:         '',
      attr_title:    '',
      description:   '',
      target:        '',
      xfn:           '',
      classes:       [],
      meta:          {}
    }
  });

  return Item;
});
