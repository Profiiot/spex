const ui = {
  state: {
    editingComponent: null,
    focusedElement: null,
    selecting: false,
    showComponents: false,
    textSelection: null
  },
  getters: {
    editingComponent(state) {
      return state.editingComponent
    },
    focusedElement: (state) => state.focusedElement,
    selecting(state, getters) {
      return state.selecting && getters.selectionSet && getters.selection.start < getters.selection.end
    },
    selection(state) {
        return state.textSelection
    },
    selectionSet: (state) => typeof state.textSelectionStart === 'number'
      && typeof state.textSelectionEnd === 'number',
    showComponents(state) {
      return state.showComponents
    }
  },
  mutations: {
    editComponent(state, component) {
      state.editingComponent = component
    },
    setFocus(state, elementId) {
      state.focussedElement = elementId
    },
    setSelection(state, selection) {
      console.log(selection)
      state.textSelection = selection
    },
    toggleComponents(state) {
      state.showComponents = !state.showComponents
    },
    toggleSelection(state, value) {
      state.selecting = typeof value === 'undefined' ? !state.selecting : value
    },
    unsetSelection(state) {
      state.textSelectionStart = null
      state.textSelectionEnd = null
    }
  }
}

export default ui
