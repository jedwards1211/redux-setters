/* @flow */

import snakeCase from 'lodash.snakecase'
import camelCase from 'lodash.camelcase'
import mapValues from 'lodash.mapvalues'
import keyBy from 'lodash.keyby'
import last from 'lodash.last'
import memoize from 'lodash.memoize'
import lodashSet from 'lodash.set'

type Action = {
  type: string,
  payload?: any,
  error?: boolean,
  meta?: Object,
}

type Reducer = (state: any, action: Action) => any

type Options = {
  domain?: string
}

type Setter = {
  (payload: any): Action,
  sub: (path: any[], options?: Options) => Setter,
  subs: (fields: Array<any[]> | {[name: string]: any[]}, options?: Options) => {[name: string]: Setter}
}

function normalize(elem: any) {
  // flow-issue(redux-setters)
  return typeof elem === 'symbol' ? elem.substring(7) : elem
}

export function createSetter(path: any[], options?: Options = {}): Setter {
  const {domain} = options

  let type = 'SET_' + snakeCase(normalize(last(path))).toUpperCase()
  if (domain) type = domain + '.' + type

  function set(payload: any): Action {
    const action: Action = {
      type,
      payload,
      meta: {
        _redux_setters_: true,
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

export function createSetters(fields: Array<any[]> | {[name: string]: any[]}, options?: Options = {}): {[name: string]: Setter} {
  if (Array.isArray(fields)) {
    fields = keyBy(fields, path => camelCase('set ' + normalize(last(path))))
  }

  return mapValues(fields, (path, name) => createSetter(path, options))
}

export function createDispatcher(dispatch: (action: Action) => any, setter: Setter): (path: any[], payload: any) => void
{
  const getSetter = memoize(path => setter.sub(path), JSON.stringify)
  return function dispatcher(path, payload) {
    dispatch(getSetter(path)(payload))
  }
}

export function createSetterReducer(options: {
  set?: (obj: any, path: any, newValue: any) => any
} = {}): Reducer {
  const set = options.set || lodashSet
  return (state, action) => {
    if (!action.meta || !action.meta._redux_setters_) return state
    if (!action.meta.reduxPath.length) return action.payload
    return set(state, action.meta.reduxPath, action.payload)
  }
}

export const reducer = createSetterReducer()
