import React from "react";
import classNames from "classnames";

import "./_button-group.scss";

const ButtonGroup = ({ buttons, label, activeButton, setActiveButton }) => {
  return (
    <div className="p-button-group">
      <div className="p-button-group__inner">
        <span className="p-button-group__label">{label}</span>
        <div className="p-button-group__buttons">
          {buttons.map((label) => (
            <button
              aria-label={`view by ${label}`}
              key={label}
              className={classNames("p-button-group__button", {
                "is-selected": activeButton === label,
              })}
              value={label}
              onClick={(e) => setActiveButton(e.currentTarget.value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ButtonGroup;
