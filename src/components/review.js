import React from 'react'

import PropTypes from 'prop-types'

import './review.css'

const Review = (props) => {
  return (
    <section className={`review-card ${props.rootClassName} `}>
      <div className="review-stars">
        <svg viewBox="0 0 1024 1024" className="review-icon10">
          <path d="M512 736l-264 160 70-300-232-202 306-26 120-282 120 282 306 26-232 202 70 300z"></path>
        </svg>
        <svg viewBox="0 0 1024 1024" className="review-icon12">
          <path d="M512 736l-264 160 70-300-232-202 306-26 120-282 120 282 306 26-232 202 70 300z"></path>
        </svg>
        <svg viewBox="0 0 1024 1024" className="review-icon14">
          <path d="M512 736l-264 160 70-300-232-202 306-26 120-282 120 282 306 26-232 202 70 300z"></path>
        </svg>
        <svg viewBox="0 0 1024 1024" className="review-icon16">
          <path d="M512 736l-264 160 70-300-232-202 306-26 120-282 120 282 306 26-232 202 70 300z"></path>
        </svg>
        <svg viewBox="0 0 1024 1024" className="review-icon18">
          <path d="M512 736l-264 160 70-300-232-202 306-26 120-282 120 282 306 26-232 202 70 300z"></path>
        </svg>
      </div>
      <main className="review-content">
        <p className="review-quote">{props.quote}</p>
        <div className="review-author1">
          <img
            alt={props.avatarAlt}
            src={props.avatarSrc}
            className="review-avatar"
          />
          <div className="review-details">
            <h1 className="review-author2">{props.author}</h1>
            <label className="review-position">{props.position}</label>
          </div>
        </div>
      </main>
    </section>
  )
}

Review.defaultProps = {
  quote:
    '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.”',
  author: 'Sima Mosbacher',
  rootClassName: '',
  avatarSrc:
    'https://images.unsplash.com/photo-1610276198568-eb6d0ff53e48?ixid=Mnw5MTMyMXwwfDF8c2VhcmNofDF8fHBvdHJhaXR8ZW58MHx8fHwxNjY3NzU5NDE3&ixlib=rb-4.0.3&w=200',
  position: 'Manager',
  avatarAlt: 'image',
}

Review.propTypes = {
  quote: PropTypes.string,
  author: PropTypes.string,
  rootClassName: PropTypes.string,
  avatarSrc: PropTypes.string,
  position: PropTypes.string,
  avatarAlt: PropTypes.string,
}

export default Review
