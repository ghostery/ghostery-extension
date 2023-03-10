/* eslint-disable */
/* source https://github.com/yury-dymov/json-api-normalizer/blob/f8b134ac4a880e885cf92c14464971d0d741f238/src/normalize.js */
/*
MIT License

Copyright (c) 2016 Yury Dymov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import camelCase from 'lodash/camelCase';
import isArray from 'lodash/isArray';
import isNull from 'lodash/isNull';
import keys from 'lodash/keys';
import merge from 'lodash/merge';

function wrap(json) {
  if (isArray(json)) {
    return json;
  }

  return [json];
}

function isDate(attributeValue) {
  return Object.prototype.toString.call(attributeValue) === '[object Date]';
}

function camelizeNestedKeys(attributeValue) {
  if (attributeValue === null || typeof attributeValue !== 'object' || isDate(attributeValue)) {
    return attributeValue;
  }

  if (isArray(attributeValue)) {
    return attributeValue.map(camelizeNestedKeys);
  }

  const copy = {};

  keys(attributeValue).forEach((k) => {
    copy[camelCase(k)] = camelizeNestedKeys(attributeValue[k]);
  });

  return copy;
}

function extractRelationships(relationships, { camelizeKeys, camelizeTypeValues }) {
  const ret = {};
  keys(relationships).forEach((key) => {
    const relationship = relationships[key];
    const name = camelizeKeys ? camelCase(key) : key;
    ret[name] = {};

    if (typeof relationship.data !== 'undefined') {
      if (isArray(relationship.data)) {
        ret[name].data = relationship.data.map(e => ({
          id: e.id,
          type: camelizeTypeValues ? camelCase(e.type) : e.type,
        }));
      } else if (!isNull(relationship.data)) {
        ret[name].data = {
          id: relationship.data.id,
          type: camelizeTypeValues ? camelCase(relationship.data.type) : relationship.data.type,
        };
      } else {
        ret[name].data = relationship.data;
      }
    }

    if (relationship.links) {
      ret[name].links = camelizeKeys ? camelizeNestedKeys(relationship.links) : relationship.links;
    }

    if (relationship.meta) {
      ret[name].meta = camelizeKeys ? camelizeNestedKeys(relationship.meta) : relationship.meta;
    }
  });
  return ret;
}

function processMeta(metaObject, { camelizeKeys }) {
  if (camelizeKeys) {
    const meta = {};

    keys(metaObject).forEach((key) => {
      meta[camelCase(key)] = camelizeNestedKeys(metaObject[key]);
    });

    return meta;
  }

  return metaObject;
}

function extractEntities(json, { camelizeKeys, camelizeTypeValues }) {
  const ret = {};

  wrap(json).forEach((elem) => {
    const type = camelizeKeys ? camelCase(elem.type) : elem.type;

    ret[type] = ret[type] || {};
    ret[type][elem.id] = ret[type][elem.id] || {
      id: elem.id,
    };
    ret[type][elem.id].type = camelizeTypeValues ? camelCase(elem.type) : elem.type;

    if (camelizeKeys) {
      ret[type][elem.id].attributes = {};

      keys(elem.attributes).forEach((key) => {
        ret[type][elem.id].attributes[camelCase(key)] = camelizeNestedKeys(elem.attributes[key]);
      });
    } else {
      ret[type][elem.id].attributes = elem.attributes;
    }

    if (elem.links) {
      ret[type][elem.id].links = {};

      keys(elem.links).forEach((key) => {
        const newKey = camelizeKeys ? camelCase(key) : key;
        ret[type][elem.id].links[newKey] = elem.links[key];
      });
    }

    if (elem.relationships) {
      ret[type][elem.id].relationships = extractRelationships(elem.relationships, {
        camelizeKeys,
        camelizeTypeValues,
      });
    }

    if (elem.meta) {
      ret[type][elem.id].meta = processMeta(elem.meta, { camelizeKeys });
    }
  });

  return ret;
}

function doFilterEndpoint(endpoint) {
  return endpoint.replace(/\?.*$/, '');
}

function extractMetaData(json, endpoint, { camelizeKeys, camelizeTypeValues, filterEndpoint }) {
  const ret = {};

  ret.meta = {};

  let metaObject;

  if (!filterEndpoint) {
    const filteredEndpoint = doFilterEndpoint(endpoint);

    ret.meta[filteredEndpoint] = {};
    ret.meta[filteredEndpoint][endpoint.slice(filteredEndpoint.length)] = {};
    metaObject = ret.meta[filteredEndpoint][endpoint.slice(filteredEndpoint.length)];
  } else {
    ret.meta[endpoint] = {};
    metaObject = ret.meta[endpoint];
  }

  metaObject.data = {};

  if (json.data) {
    const meta = [];

    wrap(json.data).forEach((object) => {
      const pObject = {
        id: object.id,
        type: camelizeTypeValues ? camelCase(object.type) : object.type,
      };

      if (object.relationships) {
        pObject.relationships = extractRelationships(object.relationships, {
          camelizeKeys,
          camelizeTypeValues,
        });
      }

      meta.push(pObject);
    });

    metaObject.data = meta;
  }

  if (json.links) {
    metaObject.links = json.links;
    ret.meta[doFilterEndpoint(endpoint)].links = json.links;
  }

  if (json.meta) {
    metaObject.meta = processMeta(json.meta, { camelizeKeys });
  }

  return ret;
}

export default function normalize(json, {
  filterEndpoint = true,
  camelizeKeys = true,
  camelizeTypeValues = true,
  endpoint,
} = {}) {
  const ret = {};

  if (json.data) {
    merge(ret, extractEntities(json.data, { camelizeKeys, camelizeTypeValues }));
  }

  if (json.included) {
    merge(ret, extractEntities(json.included, { camelizeKeys, camelizeTypeValues }));
  }

  if (endpoint) {
    const endpointKey = filterEndpoint ? doFilterEndpoint(endpoint) : endpoint;

    merge(ret, extractMetaData(json, endpointKey, {
      camelizeKeys,
      camelizeTypeValues,
      filterEndpoint,
    }));
  }

  return ret;
}
