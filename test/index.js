import {createSetter, createDispatcher, reducer} from '../src'

import {expect} from 'chai'
import {spy} from 'sinon'

describe('createSetter', () => {
  describe('without options', () => {
    describe('with single path element', () => {
      it('creates action with correct properties', () => {
        const setName = createSetter(['name'])
        const action = setName('Andy')
        expect(action.type).to.equal('SET_NAME')
        expect(action.payload).to.equal('Andy')
        expect(action.error).to.equal(undefined)
        expect(action.meta.reduxPath).to.deep.equal(['name'])

        const action2 = setName(new Error('test'))
        expect(action2.error).to.equal(true)
      })
    })
    describe('with multiple path elements', () => {
      it('creates action with correct properties', () => {
        const setName = createSetter(['user', 'name'])
        const action = setName('Andy')
        expect(action.type).to.equal('SET_NAME')
        expect(action.payload).to.equal('Andy')
        expect(action.error).to.equal(undefined)
        expect(action.meta.reduxPath).to.deep.equal(['user', 'name'])
      })
    })
  })
  describe('with domain', () => {
    describe('with single path element', () => {
      it('creates action with correct properties', () => {
        const setName = createSetter(['name'], {domain: 'ACCOUNTS'})
        const action = setName('Andy')
        expect(action.type).to.equal('ACCOUNTS.SET_NAME')
        expect(action.payload).to.equal('Andy')
        expect(action.error).to.equal(undefined)
        expect(action.meta.reduxPath).to.deep.equal(['name'])

        const action2 = setName(new Error('test'))
        expect(action2.error).to.equal(true)
      })
    })
    describe('with multiple path elements', () => {
      it('creates action with correct properties', () => {
        const setName = createSetter(['user', 'name'], {domain: 'ACCOUNTS'})
        const action = setName('Andy')
        expect(action.type).to.equal('ACCOUNTS.SET_NAME')
        expect(action.payload).to.equal('Andy')
        expect(action.error).to.equal(undefined)
        expect(action.meta.reduxPath).to.deep.equal(['user', 'name'])
      })
    })
  })
  describe('sub', () => {
    it('creates action creator that creates actions with correct properties', () => {
      const setName = createSetter(['UserView', 'document'], {domain: 'USER_VIEW'})
        .sub(['name'], {domain: 'USER'})

      const action = setName('Andy')
      expect(action.type).to.equal('USER_VIEW.USER.SET_NAME')
      expect(action.payload).to.equal('Andy')
      expect(action.error).to.equal(undefined)
      expect(action.meta.reduxPath).to.deep.equal(['UserView', 'document', 'name'])
    })
  })
  describe('subs', () => {
    it('works', () => {
      const {setFirstName, setLastName} = createSetter(['UserView', 'document'], {domain: 'USER_VIEW'})
        .subs([['firstName'], ['lastName']], {domain: 'USER'})
      let action

      action = setFirstName('Andy')
      expect(action.type).to.equal('USER_VIEW.USER.SET_FIRST_NAME')
      expect(action.payload).to.equal('Andy')
      expect(action.error).to.equal(undefined)
      expect(action.meta.reduxPath).to.deep.equal(['UserView', 'document', 'firstName'])

      action = setLastName('Edwards')
      expect(action.type).to.equal('USER_VIEW.USER.SET_LAST_NAME')
      expect(action.payload).to.equal('Edwards')
      expect(action.error).to.equal(undefined)
      expect(action.meta.reduxPath).to.deep.equal(['UserView', 'document', 'lastName'])
    })
  })
  describe('dispatcher', () => {
    it('works', () => {
      const document = createSetter(['UserView', 'document'], {domain: 'USER_VIEW'})
      const dispatch = spy()
      const dispatcher = createDispatcher(dispatch, document)

      dispatcher(['firstName'], 'Andy')
      expect(dispatch.firstCall.args).to.deep.equal([
        {
          type: 'USER_VIEW.SET_FIRST_NAME',
          payload: 'Andy',
          meta: {
            _redux_setters_: true,
            reduxPath: ['UserView', 'document', 'firstName']
          }
        }
      ])
    })
  })
  describe('reducer', () => {
    it('ignores actions not tagged with _redux_setters_', () => {
      expect(reducer(422, {type: 'TEST'})).to.equal(422)
      expect(reducer({}, {type: 'TEST', payload: 422, meta: {reduxPath: ['number']}})).to.deep.equal({})
    })
    it('handles actions tagged with _redux_setters_', () => {
      const setNumber = createSetter(['number'])
      expect(reducer({}, setNumber(422))).to.deep.equal({number: 422})
      const setRoot = createSetter([])
      expect(reducer(422, setRoot(566))).to.equal(566)
    })
  })
})
