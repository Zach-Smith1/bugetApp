const axios = require('axios');

// Base url for Hacker News API
const url = 'https://hacker-news.firebaseio.com/v0/';

// Get individual story data by ID
const getStory = async (id) => {
  try {
    const story = await axios.get(`${url}/item/${id}.json`);
    return story;
  } catch (error) {
    console.log('Error fetching a story.');
  }
};

// Get list of story IDs by type, 2nd and 3rd paramaters for start and end of list subsection
const getStories = async (type, start, end) => {
  if (!start) start = 0, end = 30;
  try {
    const { data: storyIds } = await axios.get(
      `${url}/${type}stories.json?print=pretty&orderBy="$priority"`
    );
    const stories = await Promise.all(storyIds.slice(start, end).map(getStory));
    return stories;
  } catch (error) {
    console.log('Error fetching stories list.');
  }
};

module.exports = {getStories}