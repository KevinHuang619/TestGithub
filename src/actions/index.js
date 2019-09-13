import unsplash from '../api/unsplash';

export const fetchPostsAndUsers = term => async dispatch => {
  console.log('About to fetch posts');
  await dispatch(fetchPosts(term));
  console.log('fetched posts!');
};

export const fetchPosts = term => async dispatch => {
  const response = await unsplash.get('/search/photos', {
    params: { query: term }
  });
  console.log('action!');
  dispatch({ type: 'FETCH_POSTS', payload: response.data.results });
};

export const fetchUser = id => async dispatch => {
  const response = await unsplash.get(`/users/${id}`);

  dispatch({ type: 'FETCH_USER', payload: response.data });
};