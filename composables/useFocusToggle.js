import { ref } from 'vue'

const focusOptions = ref({
  everything: true,
  camera: false,
  gaming: false,
  display: false,
  battery: false,
})

export function useFocusToggle() {
  const toggleFocus = (option) => {
    if (option === "everything") {
      if (focusOptions.value.everything) {
        Object.keys(focusOptions.value).forEach((key) => {
          if (key !== "everything") {
            focusOptions.value[key] = false;
          }
        });
      } else {
        const anyOptionOn = Object.entries(focusOptions.value).some(
          ([key, value]) => key !== "everything" && value === true
        );

        if (!anyOptionOn) {
          focusOptions.value.everything = true;
          return;
        }
      }
    } else {
      if (focusOptions.value[option]) {
        focusOptions.value.everything = false;
      } else {
        const anyOptionOn = Object.entries(focusOptions.value).some(
          ([key, value]) => key !== "everything" && value === true
        );

        if (!anyOptionOn) {
          focusOptions.value.everything = true;
        }
      }
    }
  }

  const getActiveFocus = () => {
    const activeOptions = Object.entries(focusOptions.value)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);

    if (
      activeOptions.length === 0 ||
      (activeOptions.length === 1 && activeOptions[0] === "everything")
    ) {
      return "everything";
    }

    return activeOptions.join(", ");
  }

  return {
    focusOptions,
    toggleFocus,
    getActiveFocus,
  }
}