import React from 'react'

import PropTypes from 'prop-types'

import './article.css'

const Article = (props) => {
  return (
    <section className={`article-card ${props.rootClassName} `}>
      <main className="article-content">
        <header className="article-header1">
          <h1 className="article-header2">{props.header}</h1>
        </header>
        <p className="article-description">{props.description}</p>
        <div className="article-button">
          <a
            href={props.buttonLink}
            target="_blank"
            rel="noreferrer noopener"
            className="article-link"
          >
            <p className="article-text">{props.button}</p>
          </a>
        </div>
      </main>
    </section>
  )
}

Article.defaultProps = {
  rootClassName: '',
  button: 'Read ->',
  buttonLink: '',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
  header: 'TechCrunch',
}

Article.propTypes = {
  rootClassName: PropTypes.string,
  button: PropTypes.string,
  buttonLink: PropTypes.string,
  description: PropTypes.string,
  header: PropTypes.string,
}

export default Article
