import React from 'react'

import PropTypes from 'prop-types'

import './includes.css'

const Includes = (props) => {
  return (
    <div className={`includes-mark ${props.rootClassName} `}>
      <div className="includes-icon1">
        <svg viewBox="0 0 1024 1024" className="includes-icon2">
          <path d="M384 690l452-452 60 60-512 512-238-238 60-60z"></path>
        </svg>
      </div>
      <label className="includes-label">{props.label}</label>
    </div>
  )
}

Includes.defaultProps = {
  rootClassName: '',
  label: 'Sed ut pespiciatis unde omnis',
}

Includes.propTypes = {
  rootClassName: PropTypes.string,
  label: PropTypes.string,
}

export default Includes
