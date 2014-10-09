/* global define */

define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'models/settings-model'
], function ($, _, Backbone, Marionette, Settings) {
  'use strict';

  var methodNames = {
    'archive': {
      'root':   'showHome',
      'date':   'showPostByDate',
      'search': 'showSearch'
    },
    'post': {
      'post':       'showPostBySlug',
      'page':       'showPageBySlug',
      'attachment': '',
      'default':    'showPostTypeBySlug'
    },
    'taxonomy': {
      'category': 'showPostByCategory',
      'post_tag': 'showPostByTag',
      'default' : 'showPostByTaxonomy'
    },
    'author'  : {
      'author': 'showPostByAuthor',
    }
  };

  Backbone.Router.prototype._extractParameters = function (route, fragment) {
    var params = route.exec(fragment).slice(1),
        paramsObj = {};

    _.each(this.appParams[route], function (key, index) {
      paramsObj[key.replace(':', '').replace('*', '')] = params[index] ? params[index] : null;
    });

    return [paramsObj];
  };

  Marionette.AppRouter.prototype.processAppRoutes = function (controllers, appRoutes) {
    var routes = Settings.getRoutes(methodNames);

    if (appRoutes) {
      appRoutes = _.extend(routes, appRoutes);
    }

    var routeNames = _.keys(appRoutes).reverse(); // Backbone requires reverted order of routes

    this.appParams = {};
    _.each(routeNames, function(route) {
      var controller = _.find(controllers, function (controller) {
        return controller[routes[route]] ? true : false;
      });

      this.appParams[this._routeToRegExp(route)] = route.match(/(:([^\/:()*]+)|(\*([^\/:()*]+)))/g);
      this._addAppRoute(controller, route, routes[route]);
    }, this);

    this.appRoutes = appRoutes;
  };
});