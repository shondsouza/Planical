import React from 'react'

import PropTypes from 'prop-types'

import './mark.css'

const Mark = (props) => {
  return (
    <div className="mark-mark">
      <div className="mark-icon1">
        <svg viewBox="0 0 1024 1024" className="mark-icon2">
          <path d="M384 690l452-452 60 60-512 512-238-238 60-60z"></path>
        </svg>
      </div>
      <p className="mark-label">{props.label}</p>
    </div>
  )
}

Mark.defaultProps = {
  label: '24/7 availability for whenever you need help',
}

Mark.propTypes = {
  label: PropTypes.string,
}

export default Mark
