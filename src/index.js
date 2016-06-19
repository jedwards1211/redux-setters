/* @flow */

import snakeCase from 'lodash.snakecase'
import camelCase from 'lodash.camelcase'
import mapValues from 'lodash.mapvalues'
import keyBy from 'lodash.keyby'
import last from 'lodash.last'

type Action = {
  type: string,
  error?: boolean,
  meta?: Object,
}

type Setter = {
  (payload: any): Action,
  sub: (path: any[]) => Setter
}

function normalize(elem: any) {
  // flow-issue(redux-setters)
  return typeof elem === 'symbol' ? elem.substring(7) : elem
}

export function createSetter(path: any[], options?: {
  domain?: string,
} = {}): Setter {
  const {domain} = options

  let type = 'SET_' + snakeCase(normalize(last(path))).toUpperCase()
  if (domain) type = domain + '.' + type

  function set(payload: any): Action {
    const action: Action = {
      type,
      payload,
      meta: {
        setter: true,
        reduxPath: path
      }
    }

    if (payload instanceof Error) action.error = true

    return action
  }

  set.sub = (subpath, options = {}) => {
    let suboptions = {
      domain: domain || ''
    }
    if (options.domain) suboptions.domain += '.' + options.domain
    return createSetter([...path, ...subpath], suboptions)
  }
  set.subs = (subfields, options = {}) => {
    let suboptions = {
      domain: domain || ''
    }
    if (options.domain) suboptions.domain += '.' + options.domain
    if (Array.isArray(subfields)) subfields = subfields.map(subpath => [...path, ...subpath])
    else subfields = mapValues(subfields, subpath => [...path, ...subpath])
    return createSetters(subfields, suboptions)
  }

  return set
}

export function createSetters(fields: Array<any[]> | {[name: string]: any[]}, options?: {
  domain?: string,
} = {}): {[name: string]: Setter} {
  if (Array.isArray(fields)) {
    fields = keyBy(fields, path => camelCase('set ' + normalize(last(path))))
  }

  return mapValues(fields, (path, name) => createSetter(path, options))
}
