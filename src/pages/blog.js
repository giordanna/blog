import { kebabCase, isNil } from "lodash"
import React, { Component } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Img from "gatsby-image"

class BlogPage extends Component {
  state = {
    startPagination: 0,
    itemsPerPage: 3,
    endPagination: 3,
    posts: [],
    query: "",
    type: "title",
  }

  constructor(props) {
    super(props)
    this.state = {
      posts: props.data.allMarkdownRemark.edges,
      startPagination: 0,
      itemsPerPage: 3,
      endPagination: 3,
      query: "",
      type: "title",
    }
  }

  // START: pagination-related functions
  currentPage = () => {
    return Math.ceil(this.state.startPagination / this.state.itemsPerPage + 1)
  }

  totalPages = length => {
    return length <= this.state.itemsPerPage
      ? 1
      : Math.ceil(length / this.state.itemsPerPage)
  }

  previousPage = () => {
    let startPagination = this.state.startPagination - this.state.itemsPerPage
    let endPagination = this.state.endPagination - this.state.itemsPerPage

    if (startPagination <= 0) {
      startPagination = 0
      endPagination = this.state.itemsPerPage
    }

    this.setState({ startPagination, endPagination })
  }

  nextPage = length => {
    let startPagination = this.state.startPagination + this.state.itemsPerPage
    let endPagination = this.state.endPagination + this.state.itemsPerPage

    if (endPagination >= length) {
      endPagination = length
      startPagination = length - this.state.itemsPerPage
    }

    this.setState({ startPagination, endPagination })
  }

  handlePaginationChange = e => {
    this.setState({
      startPagination: 0,
      endPagination: parseInt(e.target.value),
      itemsPerPage: parseInt(e.target.value),
    })
  }

  goToPage = number => {
    let startPagination = number * this.state.itemsPerPage
    let endPagination = startPagination + this.state.itemsPerPage

    this.setState({ startPagination, endPagination })
  }
  // END: pagination-related functions

  // START: search functionality-related functions
  updateQuery = query => {
    this.setState({ query: query.trim() })
  }

  handleTypeChange = e => {
    this.setState({
      type: e.target.value,
    })
  }
  // END: search functionality-related functions

  render() {
    // list of posts that may be filtered;
    let filteredPosts = this.state.posts

    if (this.state.query) {
      let query = this.state.query.toLowerCase()
      filteredPosts = this.state.posts.filter(post => {
        switch (this.state.type) {
          case "title": {
            return post.node.frontmatter.title.toLowerCase().includes(query)
          }
          case "tag": {
            if (
              !isNil(post.node.frontmatter.tags) &&
              post.node.frontmatter.tags.length > 0
            ) {
              const hasTag = post.node.frontmatter.tags.filter(tag =>
                tag.toLowerCase().includes(query)
              )

              return hasTag.length > 0
            } else {
              return false
            }
          }
          case "body": {
            return post.node.excerpt.toLowerCase().includes(query)
          }
          default: {
            return false
          }
        }
      })
    }

    const postsSize = this.state.posts.length
    const filteredPostsSize = filteredPosts.length

    let currentPage = this.currentPage()
    let totalPages = this.totalPages(filteredPostsSize)

    // list of paginated posts based on filteredPosts
    let paginatedPosts = filteredPosts.slice(
      this.state.startPagination,
      this.state.endPagination
    )

    let buttonsNumber = []
    for (let i = 0; i < totalPages; i++) {
      buttonsNumber.push(i)
    }

    return (
      <Layout>
        <div className="post-options">
          <div className="post-filtering">
            Filter by:{" "}
            <select
              id="filterType"
              onChange={this.handleTypeChange.bind(this)}
              value={this.state.type}
            >
              <option value="title">Title</option>
              <option value="tag">Tags</option>
              <option value="body">Body</option>
            </select>
            <input
              type="text"
              placeholder="Search for posts 🔎"
              value={this.state.query}
              onChange={event => this.updateQuery(event.target.value)}
            />
          </div>
          <div className="post-pagination__select">
            Nº of posts:{" "}
            <select
              id="pageNum"
              onChange={this.handlePaginationChange.bind(this)}
              value={this.state.itemsPerPage}
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>
        <div className="post-pagination">
          {isNil(this.state.query) ||
            (this.state.query === "" && (
              <span>
                Showing a total of <strong>{postsSize}</strong> posts
              </span>
            ))}
          {!isNil(this.state.query) && this.state.query !== "" && (
            <span>
              Showing <strong>{filteredPostsSize}</strong> from a total of{" "}
              <strong>{postsSize}</strong> posts
            </span>
          )}
          <div className="post-pagination__buttons">
            <div>
              Current Page: {currentPage} / Total Pages: {totalPages}
            </div>
            <button
              title="Go to first page"
              disabled={currentPage === 1}
              onClick={() => this.goToPage(0)}
            >
              First
            </button>
            <button
              title="Go to previous page"
              disabled={currentPage === 1}
              onClick={() => this.previousPage()}
            >
              Previous
            </button>
            {buttonsNumber.length > 1 && (
              <span>
                {buttonsNumber.map(button => (
                  <button
                    title={"Go to page " + (button + 1)}
                    key={button}
                    disabled={currentPage === button + 1}
                    onClick={() => this.goToPage(button)}
                  >
                    {button + 1}
                  </button>
                ))}
              </span>
            )}

            <button
              title="Go to next page"
              disabled={currentPage === totalPages}
              onClick={() => this.nextPage(filteredPostsSize)}
            >
              Next
            </button>
            <button
              title="Go to last page"
              disabled={currentPage === totalPages}
              onClick={() => this.goToPage(totalPages - 1)}
            >
              Last
            </button>
          </div>
        </div>
        <div className="post-list">
          {paginatedPosts.map(post => (
            <div key={post.node.id} className="post-list__item">
              <div className="post-list__thumbnail">
                <Link to={post.node.fields.slug}>
                  <Img
                    fixed={
                      post.node.frontmatter.thumbnail.childImageSharp.fixed
                    }
                  />
                </Link>
              </div>
              <div className="post-list__content">
                <h2>{post.node.frontmatter.title}</h2>
                {post.node.frontmatter.tags ? (
                  <div className="tags-container">
                    <ul className="taglist">
                      {post.node.frontmatter.tags.map(tag => (
                        <li key={tag + `tag`}>
                          <Link to={`/tags/${kebabCase(tag)}/`}>{tag}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <p>{post.node.frontmatter.date}</p>
                <div className="post-list__excerpt">
                  <p>{post.node.excerpt}></p>
                </div>
                <Link to={post.node.fields.slug}>Read More</Link>
              </div>
            </div>
          ))}
        </div>
      </Layout>
    )
  }
}

export default BlogPage

// Get all markdown data, in descending order by date, and grab the id, excerpt, slug, date, and title
export const pageQuery = graphql`
  query {
    allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          id
          excerpt(pruneLength: 250)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            tags
            thumbnail {
              childImageSharp {
                fixed(width: 200, height: 200) {
                  ...GatsbyImageSharpFixed
                }
              }
            }
          }
        }
      }
    }
  }
`
