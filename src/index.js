/* @flow */

import snakeCase from 'lodash.snakecase'
import camelCase from 'lodash.camelcase'
import mapValues from 'lodash.mapvalues'
import keyBy from 'lodash.keyby'

type Action = {
  type: string,
  error?: boolean,
  meta?: Object,
}

type Setter = {
  (payload: any): Action,
  sub: (path: any[]) => Setter
}

export function createSetter(path: any[], options?: {
  basePath?: any[],
  domain?: string,
} = {}): Setter {
  const {basePath, domain} = options

  let type = 'SET_' + path.filter(p => typeof p !== 'number')
    // flow-issue(redux-setters)
      .map(p => typeof p === 'symbol'
        ? snakeCase(p).substring(7)
        : snakeCase(p))
      .join('.')
      .toUpperCase()
  if (domain) type = domain + type

  function set(payload: any): Action {
    const action: Action = {
      type,
      payload,
      meta: {
        setter: true,
        reduxPath: basePath ? [...basePath, ...path] : path
      }
    }

    if (payload instanceof Error) action.error = true

    return action
  }

  set.sub = (subpath, options = {}) => {
    let suboptions = {
      domain: domain || '',
      basePath: path
    }
    if (options.domain) suboptions.domain += '.' + options.domain
    return createSetter([...path, ...subpath], suboptions)
  }

  return set
}

export function createSetters(fields: Array<any[]> | {[name: string]: any[]}, options?: {
  basePath?: any[],
  domain?: string,
} = {}): {[name: string]: Setter} {
  if (Array.isArray(fields)) {
    fields = keyBy(fields, path => camelCase('set' + path.filter(p => typeof p !== 'number')
      // flow-issue(redux-setters)
      .map(p => typeof p === 'symbol' ? p.substring(7) : p)
      .join(' ')))
  }

  return mapValues(fields, (path, name) => createSetter(path, options))
}
