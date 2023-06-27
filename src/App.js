const React = require("react");
const axios = require('axios');
const HNAPI = require('./fetcher.js');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stories: [],
      page: 1,
      underConstruction: false,
      prev: false
    }
  }

  // Get first 30 stories on page load
  componentDidMount() {
    HNAPI.getStories('top')
    .then((stories) => {
      this.setState({
        stories: stories
      })
    })
  }

  // function to quickly make clickable links to "under construction" page
  makeLink = (word) => {
    return <a onClick = {this.switchPage}>{word}</a>
  }

  // return to first page of stories
  startPage = (e) => {
    e.preventDefault();
    HNAPI.getStories('best', 0, 30)
    .then((stories) => {
      this.setState({
        stories: stories,
        page: 1,
        prev: false
      })
    })
  }

  // makes API call to get next 30 stories
  nextPage = (e) => {
    e.preventDefault();
    const newPage = this.state.page + 1;
    const end = newPage * 30;
    const start = end - 30;
    HNAPI.getStories('best', start, end)
    .then((stories) => {
      this.setState({
        stories: stories,
        page: newPage,
        prev: true
      })
    })
  }
  // makes API call to get previous 30 stories
  prevPage = (e) => {
    e.preventDefault();
    const newPage = this.state.page - 1;
    const end = newPage * 30;
    const start = end - 30;
    let prev = newPage === 1 ? false : true;
    HNAPI.getStories('best', start, end)
    .then((stories) => {
      this.setState({
        stories: stories,
        page: newPage,
        prev: prev
      })
    })
  }

  // changes state to render the underconstruction page
  switchPage = (e) => {
    e.preventDefault();
    let newPage = !this.state.underConstruction
    this.setState({
      underConstruction: newPage
    })
  }

  // renders each story found in stories list state
  storiesMapper = () => {
    if (this.state.stories.length === 0) {
      return <div id="loading">Loading News...</div>
    }
    let storyList = [];
    // calculate time since post
    let now = Math.floor(Date.now() / 1000)
    let count = this.state.page * 30 - 30;
    this.state.stories.forEach((story) => {
      let d = story.data;
      let timePassed = (now - d.time)/60
        if (timePassed < 60) {
          timePassed = Math.floor(timePassed )+ ' min ago'
        } else if (timePassed/60 < 24) {
          timePassed = Math.floor(timePassed/60) + ' hours ago'
        } else {
          timePassed = Math.floor(timePassed/1440) + ' days ago'
        }
      // increment list number
      count ++;
      // create block of story data with clickable links
      storyList.push(
      <div key={count} className="storyBlocks">{count}. <a id="arrow" onClick = {this.switchPage}>👍</a> <a id = "titleLink" href={d.url}>{d.title}</a><br/>
        &emsp;&emsp;&emsp;{d.score} points by <a onClick = {this.switchPage}>{d.by}</a> {timePassed} | <a onClick = {this.switchPage}>hide</a> | <a onClick = {this.switchPage}>{d.descendants} comments</a>
      </div>);
    })
    return storyList
  }

  render() {
    // show "under construction" page if relevant link is clicked
    if (this.state.underConstruction) {
      return (
      <div className="construction">
        <div>This feature is under construction, please check back later 😃</div><br/>
        <button onClick = {this.switchPage}>Back to Hacker News V3.0</button>
      </div>)
    } else {
      // if not on page 1 show previous page button
      let prevButton;
      if (this.state.prev === false) {
        prevButton = null;
      } else {
        prevButton = <button onClick = {this.prevPage}>Previous</button>;
      }
      return (
        <div>
          <h1>
            <span id="nav">&ensp;<a id="home" onClick={this.startPage}>♵ Hacker News V3.0</a> &emsp; {this.makeLink('new')} | {this.makeLink('past')} | {this.makeLink('comments')} | {this.makeLink('ask')} | {this.makeLink('show')} | {this.makeLink('jobs')}  | {this.makeLink('submit')}  <a id="login" onClick = {this.switchPage}>login</a></span><br/>
          </h1>
          <div className="stories">{this.storiesMapper()}</div>
          <span className="buttonBlock">&emsp;&emsp;&ensp;{prevButton}<button onClick = {this.nextPage}>Next</button></span>
        </div>
      );
    }
  }
}

module.exports = App;
