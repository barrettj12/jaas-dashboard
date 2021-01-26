import { ReactElement, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import { isSet } from "app/utils";

import type { ConfigProps } from "./ConfigPanel";

export default function TextAreaConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): ReactElement {
  const [inputFocused, setInputFocused] = useState(false);
  const [inputChanged, setInputChanged] = useState(false);
  const [showUseDefault, setShowUseDefault] = useState(
    config.value !== config.default
  );
  const [showDescription, setShowDescription] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  let inputValue = config.default;
  if (isSet(config.newValue)) {
    inputValue = config.newValue;
  } else if (config.default !== config.value) {
    inputValue = config.value;
  }

  useEffect(() => {
    setInputFocused(selectedConfig?.name === config.name);
  }, [selectedConfig, config]);

  useEffect(() => {
    if (
      (isSet(config.newValue) && config.newValue !== config.default) ||
      (!isSet(config.newValue) && config.value !== config.default)
    ) {
      setShowUseDefault(true);
    } else {
      setShowUseDefault(false);
    }

    if (isSet(config.newValue) && config.newValue !== config.value) {
      setInputChanged(true);
    } else {
      setInputChanged(false);
    }
  }, [config]);

  function resetToDefault() {
    setNewValue(config.name, config.default);
  }

  return (
    // XXX How to tell aria to ignore the click but not the element?
    // eslint-disable-next-line
    <div
      className={classnames("config-input", {
        "config-input--focused": inputFocused,
        "config-input--changed": inputChanged,
      })}
      data-config-name={config.name}
      onClick={() => setSelectedConfig(config)}
    >
      <h5 className="u-float-left">
        <i
          className={classnames("config-input--view-description", {
            "p-icon--plus": !showDescription,
            "p-icon--minus": showDescription,
          })}
          onClick={() => setShowDescription(!showDescription)}
          onKeyPress={() => setShowDescription(!showDescription)}
          role="button"
          tabIndex={0}
        />
        {config.name}
      </h5>
      <button
        className={classnames("u-float-right p-button--base", {
          "u-hide": !showUseDefault,
        })}
        onClick={resetToDefault}
      >
        use default
      </button>
      <div
        className={classnames("config-input--description", {
          "u-hide": !showDescription,
        })}
      >
        <pre>{config.description}</pre>
      </div>
      <textarea
        ref={inputRef}
        value={inputValue}
        onFocus={() => setSelectedConfig(config)}
        onChange={(e) => {
          setNewValue(config.name, e.target.value);
        }}
      ></textarea>
    </div>
  );
}
