import React from 'react';
import PropTypes from 'prop-types';

const ColorOption = ({ color, selected, onClick, colorClass }) => {
  return (
    <div
      className={`color-item ${selected ? 'selected' : ''} ${colorClass}`}
      onClick={() => onClick(color)}
      data-color={color}
    >
      {color}
    </div>
  );
};

ColorOption.propTypes = {
  color: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  colorClass: PropTypes.string.isRequired,
};

export default ColorOption;