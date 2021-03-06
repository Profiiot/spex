<template>
  <div class="smart-text-container" @mouseleave="onMouseLeave($event)">
    <div
        class="smart-text"
        contenteditable
        ref="textarea"
        v-bind:value="value"
        @click="updateSelection"
        @input="onChange"
        v-on:mousemove="onMouseMove($event)"
        :placeholder="placeholder"
        rows="4"
        maxlength="295"
    ></div>
    <div
        v-show="tooltipVisible"
        class="tooltip"
        ref="tooltip"
        :style="tooltipStyle"
        @mouseover="onMouseOverTooltip"
    >
      <div class="tooltip-text">
        <div class="delete-icon" title="Remove relationship" @click="unsetRelationship(tooltipId)"></div>
        <div class="tooltip-title" @click="openComponent(linkedComponent)">{{tooltipTitle}}</div>
        <div class="tooltip-description">{{tooltipText}}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../common-styles/headings';

$fontSize: 20px;
.smart-text {
  font-weight: 400;
  width: 590px;
  min-height: 5em;
  color: #031b26;
  margin-top: 8px;
  line-height: 28px;
  position: relative;
  border: none;
  font-size: $fontSize;
  outline: none;
  padding: 0;
  resize: none;
  text-overflow: ellipsis;
  cursor: text;
  &:empty::before {
    content: attr(placeholder);
    opacity: 0.7;
  }
  .smart-link {
    display: inline;
    background-color: #e3dfff;
    padding-left: 3px;
    padding-right: 3px;
    border-radius: 3px;
    &:hover {
      background-color: #bfbbd6;
    }
  }
}

.smart-text-container {
  $blank-space: 8px;
  position: relative;
  .tooltip {
    text-align: left;
    position: absolute;
    top: -$blank-space;
    left: 0;
    width: 500px;
    padding-top: $blank-space;
    border-radius: 16px;

    .tooltip-text {
      @extend %body;
      /*background-color: #979c9e;*/
      background-color: white;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      /*color: #fff;*/
      /*text-align: left;*/
      /*font-size: 20px;*/
      padding: 16px;
      /*border-radius: 2px;*/
      position: absolute;
      bottom: $blank-space;
      left: 0;
      /*box-shadow: 12px 13px 86px -24px rgba(0, 0, 0, 0.87);*/
      transform: translateX(-50%);
      width: 100%;

      .tooltip-title {
        @extend %h3;
        /*font-size: 24px;*/
        /*font-weight: 800;*/
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .delete-icon {
      background-image: url("../assets/icons/button-delete-small.png");
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      position: absolute;
      width: 24px;
      height: 24px;
      /*margin-right: 24px;*/
      /*margin-top: 8px;*/
      top:16px;
      right: 16px;
      cursor: pointer;
      opacity: 0.9;
    }

    .delete-icon:hover {
      opacity: 1;
    }
  }
}
</style>

<script>
import uniqid from 'uniqid'
import store from "@/store";

export default {
  name: "smart-description",
  data() {
    return {
      changeTracker: 1,
      textSelectionRange: null,
      tooltipComponent: null,
      tooltipId: null,
      tooltipPosition: {x: 0, y: 0},
      tooltipText: "",
      tooltipTitle: "",
      tooltipVisible: false
    };
  },
  props: {
    frame: {
      type: Object
    },
    value: {
      type: String
    },
    placeholder: {
      type: String
    }
  },
  mounted() {
    this.updateContent();
  },
  computed: {
    lastAddedRelationship() {
      return store.getters.lastAddedRelationship;
    },
    tooltipStyle() {
      const x = this.tooltipPosition.x;
      const y = this.tooltipPosition.y;
      return `transform: translate(${x}px,${y}px)`;
    },
    focusedElement() {
      return store.getters.focusedElement
    }
  },
  methods: {
    onChange() {
      this.$emit("input", this.$refs.textarea.innerHTML);
    },
    onMouseMove(event) {
      const targetElement = event && event.target;
      if (
        targetElement &&
        typeof targetElement.getAttribute("link-id") === "string"
      ) {
        const linkedElementId = targetElement.getAttribute("link-id");
        if (typeof linkedElementId === "undefined") {
          this.tooltipText = "";
          this.tooltipVisible = false;
        } else {
          const linkedElement = store.getters.componentById(linkedElementId);
          if (typeof linkedElement === "object") {
            const elementBoundingBox = targetElement.getBoundingClientRect();
            const containerBoundingBox = this.$refs.textarea.getBoundingClientRect();
            this.linkedComponent = linkedElement
            this.tooltipId = targetElement.getAttribute('id')
            this.tooltipPosition.x =
              elementBoundingBox.left -
              containerBoundingBox.left +
              elementBoundingBox.width / 2;
            this.tooltipPosition.y =
              elementBoundingBox.top - containerBoundingBox.top;
            this.tooltipText = linkedElement.description;
            this.tooltipTitle = linkedElement.name;
            this.tooltipVisible = true;
          }
        }
      } else if (
        !targetElement.classList.contains("tooltip") &&
        !targetElement.classList.contains("tooltip-text") &&
        !targetElement.classList.contains("tooltip-title") &&
        !targetElement.classList.contains("tooltip-description")
      ) {
        this.tooltipVisible = false;
      }
    },
    onMouseLeave() {
      this.tooltipVisible = false;
    },
    onMouseOverTooltip() {
      this.tooltipVisible = true;
    },
    openComponent(component) {
      store.dispatch('openComponent', component)
    },
    restoreSelection() {
      // Based on
      // http://stackoverflow.com/a/3316483/1470564
      const range = this.textSelectionRange
      if (range) {
        if (document.getSelection) {
          const sel = document.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (document.selection && range.select) {
          range.select();
        }
      }
    },
    // Based on
    // http://stackoverflow.com/a/3316483/1470564
    saveSelection() {
      console.log('save selection')
      let selection
      if (document.getSelection) {
        const sel = document.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          selection = sel.getRangeAt(0);
        }
      } else if (document.selection && document.selection.createRange) {
        selection = document.selection.createRange();
      }
      this.textSelectionRange = selection
      if (!selection) {
        console.warn('Could not save the text selection.')
      }
    },
    setRelationship(relatedElementId) {
      const selection = document.getSelection();
      if (!selection || !selection.toString() || !selection.toString().length) {
        store.dispatch("toggleSelection", false);
        return;
      }
      const currentText = selection.toString();
      const hash = uniqid()
      const id = 'smart-link-' + hash
      const html = `<div class="smart-link" link-id="${relatedElementId}" id="${id}">${currentText}</div>`;
      document.execCommand("insertHTML", false, html);
      store.dispatch("setSelectedComponentId", relatedElementId);
      store.dispatch("setFocus", "smartText");
      store.dispatch("toggleSelection", true);
      const newElement = document.getElementById(id)
      if (newElement) {
        selectText(newElement)
      }
      this.onChange()
      this.changeTracker += 1;
    },
    unsetRelationship(id) {
      const element = this.$refs.textarea.querySelector('#' + id)
      if (!element) {
        console.warn('Element with id', id, 'was not found.')
        return
      }
      const newElement = document.createElement('span')
      newElement.innerText = element.innerText
      this.tooltipVisible = false
      element.parentNode.replaceChild(newElement, element)
      this.onChange()
    },
    updateContent() {
      const textarea = this.$refs.textarea;
      if (typeof this.value === "string") {
        textarea.innerHTML = this.value;
      } else {
        textarea.innerHTML = "";
      }
      this.changeTracker += 1;
    },
    async updateSelection(event) {
      event.stopPropagation();
      const selection = document.getSelection();
      if (!selection || !selection.toString() || !selection.toString().length) {
        store.dispatch("toggleSelection", false);
        return;
      }
      let id =
        selection.anchorNode &&
        selection.anchorNode.parentElement &&
        selection.anchorNode.parentElement.attributes &&
        selection.anchorNode.parentElement.getAttribute("link-id");
      store.dispatch("setSelectedComponentId", id);
      store.dispatch("setFocus", "smartText");
      store.dispatch("toggleSelection", true);
      this.saveSelection()
      this.changeTracker += 1;
    }
  },
  watch: {
    focusedElement(newValue, oldValue) {
      if (newValue === 'componentsToggle' && oldValue === 'smartText') {
        store.dispatch('setFocus', 'smartText')
      } else if (newValue === 'smartText' && oldValue === 'componentsToggle' && this.textSelectionRange) {
        this.restoreSelection()
      }
    },
    lastAddedRelationship(value) {
      if (typeof value === "string" && value.length > 0) {
        this.setRelationship(value);
        store.dispatch("setRelationship", null);
      }
    },
    $route() {
      this.updateContent();
    }
  }
};

// https://stackoverflow.com/a/17439316
function selectText(node) {
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    console.warn("Could not select text in node: Unsupported browser.");
  }
}

</script>

<docs>
  ```jsx
  <smart-description
      :value="'This is a smart description where text fragments can be related to components in the system'"
      :placeholder="'Placeholder'"/>
  ```
</docs>
