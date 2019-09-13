import React, { Component } from "react";
import classNames from "classnames";
import "../assets/scss/black-dashboard-react.scss";
import "../assets/css/nucleo-icons.css";
import {
    Button,
    ButtonGroup,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Card,
    CardBody,
    FormGroup,
    Label,
    Input
  } from "reactstrap";
import axios from "axios";
import SearchBar from "./SearchBar"
import Scene from "./Scene"
import { connect } from 'react-redux';
import { fetchPosts } from '../actions';

let SCALE_PREVIEW = 1.68;
let MAX_WIDTH = 450 * SCALE_PREVIEW;
let MAX_HEIGHT = (MAX_WIDTH / 16) * 9;
let FONT_SIZE = 13 * SCALE_PREVIEW;
let WORD_MARGIN = 24 * SCALE_PREVIEW;


class DashBoard extends Component {
    constructor(props) {
        super(props);
    }
    state = {
        bigChartData: "data1",
        language: "english",
        text_style: 1, // text animation 1 or 2
        music: 0, // music 0 or 1
        scenePlaytime: 0, // sec
        fullPlaytime: 0, // sec
        isDisablePlay: false,
        showPreviewModal: false,
        isLoadingApi: false,
        text_display: <div />,
        scenes: [
        ],
        audios: [
          "https://storage.googleapis.com/lumen5-prod-audio/gothic-30z1OCWHSO4wee111gPGbe.mp3",
          "https://storage.googleapis.com/lumen5-prod-audio/holly-in-the-snowfkRwixHOarpzLAwFBzLc.mp3",
          "https://storage.googleapis.com/lumen5-prod-audio/home-at-last-is-she-thereM1kcjgrdLu2mk3e2ED3s.mp3",
          "https://storage.googleapis.com/lumen5-prod-audio/bnm-0715-rubber-trees-fullB5W821PYiWsd.mp3",
          "https://storage.googleapis.com/lumen5-prod-audio/netherworld30GyArwSSgBpNeoDx8RH6.mp3"
        ]
      };

      setBgChartData = name => {
        this.setState({
          bigChartData: name
        });
      };

    doSerialize = newProps => {
      return {
        position: 0,
        duration: 10,
        text: [this.refs.title_article.value],
        placements: ["center-top"],
        selected_media_index: 0,
        medias: newProps.imgs.map(img => ({
          is_video: false,
          url: img.urls.regular
          // url: media.isVideo
          //   ? "https://storage.googleapis.com/lumen5-prod-video/preview-I1zn-videocontentDHmMj5Bwoman-lying-on-the-sofa-and-watching-television_v128pz7b__D.mp4"
          //   : "https://storage.googleapis.com/lumen5-prod-images/tmpYpUyfR.jpg"
        }))
      };
    };
      
    // --- API
    onApiCall = () => {
        var articleTitle = this.refs.title_article.value;
        var articleText = this.refs.text_article.value;
        var articleUrl = this.refs.url_article.value;
        var articleLimit = this.refs.limit_article.value;

        if (articleText === "" && articleUrl === "") return;

        var hasText = articleText !== "";

        this.setState({ 
          isLoadingApi: true,
          text_display: articleText 
        });
        this.props.fetchPosts(articleText);
        //this.setState({
        //isLoadingApi: false,
        //scenes: newScenes,
        //text_display: articleText
        //});
    };

    // --- general functions
    toMMSS = s => {
        var sec_num = parseInt(s, 10); // don't forget the second param
        var minutes = Math.floor(sec_num / 60);
        var seconds = sec_num - minutes * 60;

        if (minutes < 10) {
        minutes = "0" + minutes;
        }
        if (seconds < 10) {
        seconds = "0" + seconds;
        }
        return minutes + ":" + seconds;
    };

    componentWillReceiveProps(newProps) {
      console.log('233')
      console.log(newProps);
      let newSc = this.doSerialize(newProps);
      console.log(newSc)
      this.setState({scenes : [newSc]});
      this.setState({ isLoadingApi: false });
    }
    // --- UI
    render() {
        return (
            <div
              className="App"
              style={{
                margin: "16px"
              }}
            >
              <div
                style={{
                  left: 0,
                  width: "40%",
                  height: "100%",
                  position: "fixed",
                  zIndex: 1,
                  top: 0,
                  overflowX: "hidden",
                  padding: "16px",
                  boxShadow: "0 0 0 0 black, 0 0 10px 0 black",
                  backgroundColor: "rgba(255,255,255,0.03)",
                }}
              >
                {/* ----- display ----- */}
                <Card>
                  <CardBody style={{ textAlign: "justify" }}>
                    <span
                      style={{
                        color: "white"
                      }}
                    >
                        {this.state.text_display}
                    </span>
                  </CardBody>
                </Card>
                {/* ----- form ----- */}
                <FormGroup>
                  
                  <input
                    ref="title_article"
                    type="text"
                    className="form-control"
                    placeholder="Paste title here"
                    />
                  
                <Card>
                  <CardBody style={{ textAlign: "justify" }}>
                    <span
                      style={{
                        color: "white"
                      }}
                    >

                    <textarea
                    ref="text_article"
                    rows="50" 
                    cols="60"
                    placeholder="Paste article text here"
                    className="form-control">
                      children play basketball
                    </textarea>
                   
                    </span>
                  </CardBody>
                </Card>
                  or
                  <br />
                  <input
                    ref="url_article"
                    type="text"
                    className="form-control"
                    placeholder="Paste article url here (eg. http://www.article.com)"
                  />
                  <br />
                  <input
                    ref="limit_article"
                    type="number"
                    className="form-control"
                    defaultValue="3"
                    placeholder="Limit no."
                  />
                </FormGroup>
                <br />
                <br />
                {/* ----- music ----- */}
                <FormGroup>
                    <Label>Music:</Label>
                    <Input
                    type="select"
                    name="select"
                    id="music_selection"
                    >
                    <option value="0">Music 1</option>
                    <option value="1">Music 2</option>
                    <option value="2">Music 3</option>
                    <option value="3">Music 4</option>
                    <option value="4">Music 5</option>
                    </Input>
                </FormGroup>
                <br />
                {/* ----- api ----- */}
                <Button
                  onClick={this.onApiCall}
                  color="primary"
                  className="animation-on-hover"
                  disabled={this.state.isLoadingApi}
                >
                  {this.state.isLoadingApi ? "Loading..." : "Submit"}
                </Button>
                <br />
                <div
                style={{
                    bottom : "0px"
                }}
                >
                <ButtonGroup
                className="btn-group-toggle float-right"
                data-toggle="buttons"
                >
                <Button
                    tag="label"
                    color="info"
                    id="0"
                    size="sm"
                    className={classNames("btn-simple", {
                        active: this.state.bigChartData === "data1"
                      })}
                    onClick={() => this.setBgChartData("data1")}
                >
                    <input
                    defaultChecked
                    className="d-none"
                    name="options"
                    type="radio"
                    />
                    <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                    English
                    </span>
                    <span className="d-block d-sm-none">
                    <i className="tim-icons icon-single-02" />
                    </span>
                </Button>
                <Button
                    color="info"
                    id="1"
                    size="sm"
                    tag="label"
                    className={classNames("btn-simple", {
                        active: this.state.bigChartData === "data2"
                      })}
                    onClick={() => this.setBgChartData("data2")}
                >
                    <input
                    className="d-none"
                    name="options"
                    type="radio"
                    />
                    <span className="d-none d-sm-block d-md-block d-lg-block d-xl-block">
                    Chinese
                    </span>
                    <span className="d-block d-sm-none">
                    <i className="tim-icons icon-gift-2" />
                    </span>
                </Button>
                </ButtonGroup>
                </div>
                <br />
                <br />
                <br />
              </div>
              <div
                style={{
                  right: 0,
                  width: "60%",
                  height: "100%",
                  position: "fixed",
                  zIndex: 1,
                  top: 0,
                  overflowX: "hidden",
                  margin: "16px",
                  textAlign: "center"
                }}
              >
                {/*<Button color="primary" onClick={this.togglePreviewModal}>
                  Preview
              </Button>*/}
                <br />
                <br />
                {/* ----- list ----- */}
                <div>
                  {this.state.scenes.map((scene, index) => (
                    
                    <Scene
                      key={index}
                      scenes={this.state.scenes}
                      scene={scene}
                      index={index}
                      language={this.state.language}
                      text_style={this.state.text_style}
                      onRearrange={this.onRearrange}
                      onRemoveScene={this.onRemoveScene}
                      onDurationChange={this.onDurationChange}
                      onMediaChange={this.onMediaChange}
                      onTextChange={this.onTextChange}
                    />
                  ))}
                </div>
                <br /> <br />
              </div>
      
              {/* ----- modal backdrop ----- */}
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.7)",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%",
                  position: "absolute",
                  zIndex: 1,
                  overflow: "hidden",
                  textAlign: "center",
                  display:
                    this.state.showPreviewModal || this.state.isLoadingApi
                      ? "block"
                      : "none"
                }}
              />
      
              {/* ----- preview ----- */}
              <Modal
                isOpen={this.state.showPreviewModal}
                style={{ 
                  overflow: "hidden",
                  textAlign: "center"
                }}
                size="lg"
              >
                <ModalHeader
                  className="justify-content-center"
                >
                  Preview
                </ModalHeader>
                <ModalBody className="justify-content-center">
                  <p style={{ textAlign: "right" }}>
                    ({this.toMMSS(this.state.scenePlaytime)})
                  </p>
                  {/* ----- canvas ----- */}
                  <canvas
                    id="c"
                    ref="c"
                    width={MAX_WIDTH}
                    height={MAX_HEIGHT}
                    style={{
                      backgroundColor: "#dfdfdf"
                    }}
                  />
                  <p style={{ textAlign: "right" }}>
                    {// current time
                    this.toMMSS(this.state.fullPlaytime) +
                      "/" +
                      // total time
                      this.toMMSS(
                        this.state.scenes.reduce(
                          (total, curr) => total + (curr.duration || 0),
                          0
                        )
                      )}
                  </p>
                  <br />
                  {/* ----- video ----- */}
                  <video
                    id="v"
                    ref="v"
                    style={{
                      visibility: "hidden",
                      position: "absolute",
                      backgroundColor: "#dfdfdf"
                    }}
                    controls
                    loop
                  />
                  {/* ----- image ----- */}
                  <img
                    id="img"
                    ref="img"
                    style={{ visibility: "hidden", position: "absolute" }}
                    alt=""
                  />
                  {/* ----- audio ----- */}
                  <audio id="m" ref="m" />
                </ModalBody>
                <ModalFooter className="justify-content-center">
                  {/* ----- play ----- */}
                  <Button
                    ref="play_btn"
                    onClick={this.playAllScened}
                    color="primary"
                    className="btn-icon animation-on-hover"
                    disabled={this.state.isDisablePlay}
                  >
                    <i className="tim-icons icon-triangle-right-17" />
                  </Button>
                </ModalFooter>
              </Modal>
      
              {/* ----- loading ----- */}
              <Modal isOpen={this.state.isLoadingApi} size="sm">
                <ModalBody className="justify-content-center">
                  <p>loading...</p>
                </ModalBody>
              </Modal>
            </div>
        );
    }

    // --- REMOVE SCENE
    onRemoveScene = item => {
      this.setState(state => {
        const scenes = state.scenes.filter(
          scene => scene.position !== item.position
        );
  
        return {
          scenes
        };
      });
    };
  
    // --- CHANGE DURATION
    onDurationChange = (item, e) => {
      let newScenes = [...this.state.scenes];
      newScenes[item.position].duration = Number(e.target.value);
      this.setState({ scenes: newScenes });
    };
  
    // --- CHANGE TEXT
    onTextChange = (item, texts, placements) => {
      let newScenes = [...this.state.scenes];
      newScenes[item.position].text = texts;
      newScenes[item.position].placements = placements;
      this.setState({ scenes: newScenes });
    };
  
    // --- CHANGE MEDIA
    onMediaChange = (item, index) => {
      let newScenes = [...this.state.scenes];
      newScenes[item.position].selected_media_index = index;
      this.setState({ scenes: newScenes });
    };
  
    // --- REARRANGE
    onRearrange = (item, is_to_front) => {
      var newPosition = is_to_front ? item.position - 1 : item.position + 1;
      var oldPosition = item.position;
      // --- change position data
      var new_scenes = [];
      this.state.scenes.forEach(scene => {
        // console.log("scene: " + scene.text);
        // console.log("position: " + scene.position);
        if (scene.position === newPosition) {
          // move used-to-be
          scene.position = oldPosition;
        } else if (scene.position === item.position) {
          // move user selected
          scene.position = newPosition;
        }
        // console.log("new position: " + scene.position);
        new_scenes.push(scene);
      });
      // --- sort
      new_scenes = new_scenes.sort((a, b) => {
        const positionA = a.position;
        const positionB = b.position;
  
        let comparison = 0;
        if (positionA > positionB) {
          comparison = 1;
        } else if (positionA < positionB) {
          comparison = -1;
        }
        return comparison;
      });
      this.setState({ scenes: new_scenes });
    };
  
    // --- LANGUAGE
    onLanguageChanged = language => {
      this.setState({ language: language });
    };
    // --- TEXT STYLE
    onStyleChanged = selection => {
      this.setState({ text_style: selection });
    };
    // --- MUSIC
    onMusicChanged = e => {
      let musicSelection = e.target.value;
      this.setState({ music: parseInt(musicSelection) });
    };
  
    // --- PREVIEW MODEL
    togglePreviewModal = anim => {
      // if close preview reset
      this.doStop();
      // close modal
      this.setState({
        showPreviewModal: !this.state.showPreviewModal
      });
    };
}

const mapStateToProps = state => {
  console.log('Dashbaord mapState');
  return { imgs: state.imgs };
};

export default connect(
  mapStateToProps,
  { fetchPosts }
)(DashBoard);
//export default DashBoard;