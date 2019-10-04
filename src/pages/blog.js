import { kebabCase } from "lodash"
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
  }

  constructor(props) {
    super(props)
    this.state = {
      posts: props.data.allMarkdownRemark.edges,
      startPagination: 0,
      itemsPerPage: 3,
      endPagination: 3,
    }
  }

  currentPage = () => {
    return Math.ceil(this.state.startPagination / this.state.itemsPerPage + 1)
  }

  totalPages = () => {
    return this.state.posts.length <= this.state.itemsPerPage
      ? 1
      : Math.ceil(this.state.posts.length / this.state.itemsPerPage)
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

  nextPage = () => {
    let startPagination = this.state.startPagination + this.state.itemsPerPage
    let endPagination = this.state.endPagination + this.state.itemsPerPage

    if (endPagination >= this.state.posts.length) {
      endPagination = this.state.posts.length
      startPagination = this.state.posts.length - this.state.itemsPerPage
    }

    this.setState({ startPagination, endPagination })
  }

  handleChange = e => {
    this.setState({
      startPagination: 0,
      endPagination: parseInt(e.target.value),
      itemsPerPage: parseInt(e.target.value),
    })
  }

  render() {
    let paginatedPosts = this.state.posts.slice(
      this.state.startPagination,
      this.state.endPagination
    )

    let currentPage = this.currentPage()
    let totalPages = this.totalPages()

    return (
      <Layout>
        <div className="post-pagination">
          <div className="post-pagination__buttons">
            <div>
              Current Page: {currentPage} / Total Pages: {totalPages}
            </div>
            <button
              disabled={currentPage === 1}
              onClick={() => this.previousPage()}
            >
              Previous Page
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => this.nextPage()}
            >
              Next Page
            </button>
          </div>

          <div className="post-pagination__select">
            Change pagination:
            <select
              id="pageNum"
              onChange={this.handleChange.bind(this)}
              value={this.state.itemsPerPage}
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
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
