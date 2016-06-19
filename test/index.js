import {createSetter} from '../src'

import {expect} from 'chai'

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
})
