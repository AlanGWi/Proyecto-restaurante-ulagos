<template>
  <div class="custom-modal" :class="{ 'is-active': isActive }">
    <div class="custom-modal-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    isActive: {
      get() {
        return this.show;
      },
      set(value) {
        this.$emit('update:show', value);
      },
    },
  },
};
</script>

<style>
.custom-modal {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out; /* Transición suave para el deslizamiento */
  z-index: 20;
}

.custom-modal.is-active {
  transform: translateY(0); /* Cuando se activa, el modal sube */
}

.custom-modal-content {
  background-color: rgb(249, 249, 249);
  padding: 1.5rem;
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  width: 100%;
  max-height: 80%;
  overflow-y: auto;
  z-index: 20;
}
</style>