import React from 'react';
import { connect } from 'react-redux';
import { fetchPosts } from '../actions';

class SearchBar extends React.Component {
  state = { term: '' };

  componentDidMount() {
    console.log('init sb');
    //this.props.fetchPostsAndUsers();
  }

  onFormSubmit = event => {
    event.preventDefault();
    console.log('Submit!');
    this.props.fetchPosts(this.state.term);
    //this.props.onSubmit(this.state.term);
  };

  render() {
    return (
      <div>
        <form onSubmit={this.onFormSubmit} >
          <div>
            <label>Image Search</label>
            <input
              type="text"
              value={this.state.term}
              onChange={e => this.setState({ term: e.target.value })}
            />
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  console.log('SearchBar mapState');
  console.log(state)
  return { imgs: state.imgs };
};

export default connect(
  mapStateToProps,
  { fetchPosts }
)(SearchBar);
//export default SearchBar;
