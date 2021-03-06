<template>
  <div class="diagram-item" :class="{dragging, relating}" :style="componentStyle" @mouseover="mouseover" @mouseleave="mouseleave">
    <div class="component-name">
      <label>{{componentName}}</label>
      <div class="tiny-button remove-button" title="Remove item" @click="removeItem" ref="removeButton">&times;</div>
      <div class="tiny-button add-relationship-button" ref="addRelationshipButton" @click="addRelationship" title="Add relationship">+</div>
    </div>
    <div class="component-image" draggable="false">
      <img v-if="imageUrl" :src="imageUrl" draggable="false">
    </div>
  </div>
</template>

<style lang="scss" scoped>


// Layout
$square-side: 50px;
.diagram-item {
  width: $square-side;
  margin-left: - $square-side/2;
  margin-top: - $square-side/2;
}

.component-image {
  width: 100%;
  height: $square-side;
  position: relative;
  img {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: $square-side;
  }
}

.component-name {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  border-radius: $square-side/2 0 0 $square-side/2;
  box-sizing: border-box;
  padding-left: $square-side + 5px;
  padding-right: 12px;
  min-width: $square-side * 2;
}

$tiny-button-side: 12px;
.tiny-button {
  position: absolute;
  width: $tiny-button-side;
  height: $tiny-button-side;
  border-radius: 50%;
  text-align: center;
  line-height: $tiny-button-side;
  font-weight: bold;

}

.remove-button {
  top: - $tiny-button-side/2;
  right: - $tiny-button-side/2;
}

.add-relationship-button {
  top: $square-side/2 - $tiny-button-side/2;
  right: - $tiny-button-side/2;
}

// Colors
.add-relationship-button {
  background-color: hsl(0, 0, 95%);
  border: 1px dashed hsl(200, 30, 80%);
}
.component-image {
  background-color: #ddd;
}
.component-name {
  color: #1F2122;
  background-color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.tiny-button {
  background-color: gray;
  border: 1px solid white;
  color: white;
}

// UX
.diagram-item,
.component-name {
  cursor: pointer;
  user-select: none;
}

.tiny-button {
  opacity: 0;
  transition: opacity .3s;
}

.diagram-item:not(.dragging):not(.relating):hover .tiny-button {
  opacity: 0.35;
  &:hover {
    opacity: 1;
  }
}

.diagram-item:not(.dragging):not(.relating):hover .remove-button {
  transition-delay: 0.5s;
  &:hover {
    transition-delay: 0s;
  }
}

.diagram-item.relating:hover .component-image {
  box-shadow: 0 0 22px hsl(200, 80%, 80%);
}

</style>

<script>
import store from '@/store'

export default {
  name: 'diagram-item',
  props: {
    item: {
      type: Object
    },
    focusOut: {
      type: Boolean
    },
    parentElement: {
      type: Object
    }
  },
  data() {
    const currentCoords = this.item ? Object.assign({}, this.item.position) : null
    return {
      currentCoords,
      currentDrag: {
        x: 0,
        y: 0
      },
      dragging: false,
      initialDragCoords: null,
      initialCoords: currentCoords,
      mouseDown: false
    }
  },
  methods: {
    addRelationship(event) {
      store.dispatch('addNewDiagramRelationship', {
        from: this.item,
        to: {
          x: event.x,
          y: event.y
        }
      })
    },
    drag(event) {
      this.dragging = true
      this.currentDrag = {
        x: event.x - this.initialDragCoords.x,
        y: event.y - this.initialDragCoords.y
      }
      this.currentCoords = {
        x: this.initialCoords.x + this.currentDrag.x,
        y: this.initialCoords.y + this.currentDrag.y
      }
      store.commit('updateDiagramItemPosition', {
        item: this.item,
        newPosition: this.currentCoords
      })
      return false
    },
    dragend() {
      this.initialDragCoords = null
      this.initialCoords = this.currentCoords
      this.currentDrag = {
        x: 0,
        y: 0
      }
      store.dispatch('updateDiagramItem', {
        item: this.item,
        newProperties: {
          position: this.currentCoords
        }
      })
      return false
    },
    mouseleave() {
      if (store.getters.newDiagramRelationship) {
        store.dispatch('hoverDiagramItem', false)
      }
    },
    mouseover() {
      if (store.getters.newDiagramRelationship && store.getters.newDiagramRelationship.from.id !== this.item.id) {
        store.dispatch('hoverDiagramItem', this.item)
      }
    },
    mouseup() {
      event.stopPropagation()
      if (this.relating) {
        store.dispatch('addDiagramRelationship', {
          from: {
            itemId: store.getters.newDiagramRelationship.from.id
          },
          to: {
            itemId: this.item.id
          }
        })
        return
      }
      if (this.dragging) {
        this.dragend()
      } else {
        if (event.target !== this.$refs.removeButton
          && event.target !== this.$refs.addRelationshipButton) {
          this.openComponent()
        }
      }
      this.mouseDown = false
      this.dragging = false
    },
    dragstart(event) {
      if(this.relating) {
        return
      }
      store.dispatch('setFocus', 'diagram')
      this.mouseDown = true
      this.initialDragCoords = {
        x: event.x,
        y: event.y
      }
      return false
    },
    openComponent() {
      store.dispatch("openComponent", this.component);
    },
    removeItem() {
      store.dispatch('removeDiagramItem', this.item)
    }
  },
  mounted() {
    this.$el.addEventListener('mousedown', event => {
      this.dragstart(event)
    })
    this.$el.parentElement.addEventListener('mousemove', event => {
      if (this.mouseDown) {
        this.drag(event)
      }
    })
    this.$el.addEventListener('mouseup', event => {
      this.mouseup(event)
    })
  },
  computed: {
    component() {
      if (this.item) {
        return store.getters.componentById(this.item.componentId)
      } else {
        return null
      }
    },
    componentName() {
      if (typeof this.component === 'object' && this.component !== null) {
        return this.component.name
      }
      return ''
    },
    componentStyle() {
      const position = this.currentCoords
      if (typeof position === 'object' && position !== null) {
        return {
          transform: `translate(${position.x}px, ${position.y}px)`
        }
      } else {
        return {}
      }
    },
    focusedElement() {
      return store.getters.focusedElement
    },
    imageUrl() {
      if (this.component) {
        return this.component.imageUrl
      } else {
        return null
      }
    },
    relating() {
      return !!(store.getters.newDiagramRelationship)
    }
  }
}
</script>

<docs>
  ```jsx
  <diagram-item></diagram-item>
  ```
</docs>