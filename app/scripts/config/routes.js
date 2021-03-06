/* global define */

define([
  'underscore',
  'backbone',
  'models/settings-model'
], function (_, Backbone, Settings) {
  'use strict';

  var Routes = function () { };

  Routes.prototype = {
    schema: {
      'url':   function (page) {
        return 'page/' + page;
      },
      'query': function (page) {
        return '&page=' + page;
      }
    },

    /**
     * Extract route string from an absolute URL.
     * @param  {String} url Absolute or relative URL.
     * @return {String}     Route.
     */
    routeFromAbsoluteUrl: function (url) {
      if (Settings.get('site_url') + '/' === url) {
        return '';
      }

      var re = new RegExp('^' + Settings.get('site_url') + '/(.+?)/?$', 'g');
      return url.replace(re, '$1');
    },

    processRoutes: function (routes) {
      var keys    = _.keys(routes),
          mapping = {};

      _.each(keys, function (key) {
        var route = routes[key];
        if (!mapping.hasOwnProperty(route.type)) {
          mapping[route.type] = [];
        }

        mapping[route.type].push(getCurlyKey(key));
      });

      return mapping;
    },

    routeIsPaged: function (route) {
      var isPaged = route.match(/(page\/\d+\/?$)|([?&]page=\d+)/);
      return isPaged !== null && isPaged.length > 0;
    },

    buildUri: function (route, replace) {
      var pageRegex   = /(\(\/?page\/.*\))/g,
          pageSection = route.match(pageRegex);

      pageSection = (_.isEmpty(pageSection)) ? '' : pageSection[0];

      if (!replace.paged || replace.paged < 2) {
        route = route.replace(pageSection, '');
        delete replace.paged;
      } else {
        var pageSectionContentRegex = new RegExp(pageSection, 'g'),
            pageSectionContent      = pageSection.match(pageSectionContentRegex);

        route = route.replace(pageSection, pageSectionContent);
      }

      return route.supplant(replace);
    },

    getPagedRoute: function (filter, page) {
      var url   = this.schema[filter.get('paging-schema')],
          regex = /(page\/\d)|(&page=\d)/,
          route = this._getRoute();

      route = (this.routeIsPaged(route)) ? route.replace(regex, url(page))
                                         : route + '/' + url(page);
      return route;
    },

    getCurrentPage: function () {
      var regex = /page\/(\d)|&page=\d/,
          route = this._getRoute();

      return regex.test(route) ? parseInt(route.match(regex)[1], 10) : 1;
    },

    _getRoute: function () {
      return Backbone.history.fragment;
    }
  };

  function getCurlyKey (key) {
    return key.replace(/[:*$]([\w\-_\\]+)(<[^>]+>)?/g, '{$1}');
  }

  return new Routes();
});
