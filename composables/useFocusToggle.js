import { ref, computed } from "vue";

const focusOptions = ref({
  everything: true,
  camera: false,
  gaming: false,
  display: false,
  battery: false,
});

export function useFocusToggle() {
  const toggleFocus = (option) => {
    if (option === "everything") {
      if (focusOptions.value.everything) {
        // If everything is being turned on, turn off other options
        Object.keys(focusOptions.value).forEach((key) => {
          if (key !== "everything") {
            focusOptions.value[key] = false;
          }
        });
      } else {
        // If everything is being turned off, check if any other option is on
        const anyOptionOn = Object.entries(focusOptions.value).some(
          ([key, value]) => key !== "everything" && value === true,
        );

        // If no other option is on, keep everything on
        if (!anyOptionOn) {
          focusOptions.value.everything = true;
        }
      }
    } else {
      // If a specific option is being toggled
      if (focusOptions.value[option]) {
        // If turning on a specific option, turn off "everything"
        focusOptions.value.everything = false;
      } else {
        // If turning off a specific option, check if any other option is on
        const anyOptionOn = Object.entries(focusOptions.value).some(
          ([key, value]) => key !== "everything" && key !== option && value === true,
        );

        // If no other option is on, turn on "everything"
        if (!anyOptionOn) {
          focusOptions.value.everything = true;
        }
      }
    }
  };

  // Use computed property for active focus to avoid creating new arrays and strings on each call
  const activeFocus = computed(() => {
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
  });

  // For backward compatibility, keep the function interface
  const getActiveFocus = () => activeFocus.value;

  return {
    focusOptions,
    toggleFocus,
    getActiveFocus,
    activeFocus,
  };
}
