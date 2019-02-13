const ui = {
  state: {
    editingComponent: null,
    focusedElement: null,
    lastAddedRelationship: null,
    selecting: false,
    showComponents: false,
    textSelection: null
  },
  getters: {
    editingComponent(state) {
      return state.editingComponent
    },
    focusedElement: (state) => state.focusedElement,
    lastAddedRelationship: (state) => state.lastAddedRelationship,
    selecting(state, getters) {
      return state.selecting && getters.focusedElement === 'smartText' || getters.focusedElement === 'componentList'
    },
    selection(state) {
      return state.textSelection
    },
    showComponents(state) {
      return state.showComponents
    }
  },
  mutations: {
    editComponent(state, component) {
      state.editingComponent = component
    },
    setFocus(state, elementId) {
      state.focusedElement = elementId
    },
    setRelationship(state, id) {
      state.lastAddedRelationship = id
    },
    setSelection(state, selection) {
      state.textSelection = selection
    },
    toggleComponents(state, value) {
      state.showComponents = typeof value === 'undefined' ? !state.showComponents : value
    },
    toggleSelection(state, value) {
      state.selecting = typeof value === 'undefined' ? !state.selecting : value
    },
    unsetSelection(state) {
      state.textSelection = null
    }
  },
  actions: {
    editComponent(context, component) {
      context.commit('editComponent', component)
    },
    setFocus(context, focusedElement) {
      context.commit('setFocus', focusedElement)
    },
    setRelationship(context, relationship) {
      context.commit('setRelationship', relationship)
    },
    setSelection(context, selection) {
      context.commit('setSelection', selection)
    },
    toggleComponents(context, value) {
      context.commit('toggleComponents', value)
    },
    toggleSelection: (context, value) => context.commit('toggleSelection', value)
  }
}

export default ui
