import React, { Component } from "react";
import {
    Button,
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
  
  let SCALE_PREVIEW = 1.68;
  let MAX_WIDTH = 450 * SCALE_PREVIEW;
  let MAX_HEIGHT = (MAX_WIDTH / 16) * 9;
  let FONT_SIZE = 13 * SCALE_PREVIEW;
  let WORD_MARGIN = 24 * SCALE_PREVIEW;
  
  // small thumbnail
  let S_MAX_WIDTH = MAX_WIDTH / SCALE_PREVIEW;
  let S_MAX_HEIGHT = MAX_HEIGHT / SCALE_PREVIEW;
  let S_FONT_SIZE = FONT_SIZE / SCALE_PREVIEW;
  let S_WORD_MARGIN = WORD_MARGIN / SCALE_PREVIEW;
  
  var timer;
  var currIndex = 0;
// --- SCENE
class Scene extends Component {
    state = {
      showMediaModal: true,
      isEditing: false,
      texts: this.props.scene.text,
      placements: this.props.scene.placements
    };
    
    //life cycle
    shouldComponentUpdate(nextProps, nextState) {
      return (
        this.state.showMediaModal !== nextState.showMediaModal ||
        this.state.isEditing !== nextState.isEditing ||
        this.state.texts !== nextState.texts ||
        this.state.placements !== nextState.placements ||
        this.props.scenes !== nextProps.scenes ||
        this.props.scene !== nextProps.scene ||
        this.props.text_style !== nextProps.text_style ||
        this.props.language !== nextProps.language ||
        this.props.index !== nextProps.index
      );
    }
  
    componentWillReceiveProps(newProps) {
      // bug fixed: text remain position if rearrange scene
      if (newProps.scene.text !== this.state.texts) {
        this.setState({ texts: newProps.scene.text });
      }
      if (newProps.scene.placements !== this.state.placements) {
        this.setState({ placements: newProps.scene.placements });
      }
    }
  
    componentDidUpdate(prevProps, prevState) {
      // console.log("componentDidUpdate");
      this.setup();
    }
  
    componentDidMount() {
      this.setup();
    }
  
    setup = () => {
      // setup
      var scene = this.props.scene;
      var media = scene.medias[scene.selected_media_index];
      let elmnt = media.is_video ? this.refs.s_v : this.refs.s_img;
      elmnt.src = media.url; // update url
  
      var texts = this.state.texts;
      var ctxs = texts.map((text, index) => this.refs[index].getContext("2d"));
  
      // text.forEach((ctx, index, array) => {
      //   console.log(this.refs[index]);
      // });
  
      // clear
      ctxs.forEach((ctx, index, array) => {
        ctx.clearRect(0, 0, MAX_WIDTH, MAX_HEIGHT);
      });
  
      // ---- Draw thummnial after video data loaded.
      var _listener = () => {
        var vw = media.is_video ? elmnt.clientWidth : elmnt.naturalWidth;
        var vh = media.is_video ? elmnt.clientHeight : elmnt.naturalHeight;
        // draw
        // --- Video / Image
        var scale = Math.max(S_MAX_WIDTH / vw, S_MAX_HEIGHT / vh);
  
        ctxs.forEach((ctx, index, array) => {
          // --- Draw
          ctx.drawImage(
            elmnt,
            (vw - S_MAX_WIDTH / scale) / 2, // crop image x
            (vh - S_MAX_HEIGHT / scale) / 2, // crop image y
            S_MAX_WIDTH / scale, // crop image width
            S_MAX_HEIGHT / scale, // crop image height
            0, // draw to canvas x
            0, // draw to canvas y
            S_MAX_WIDTH, // draw to canvas width
            S_MAX_HEIGHT // draw to canvas height
          );
  
          // --- Gray Layer
          ctx.fillStyle = "RGBA(0,0,0,0.2)";
          ctx.fillRect(0, 0, S_MAX_WIDTH, S_MAX_HEIGHT);
  
          if (!this.state.isEditing) {
            // --- Text
            ctx.font =
              this.props.text_style === 1
                ? "bold " + S_FONT_SIZE + "pt Open Sans"
                : S_FONT_SIZE + "pt Russo One"; // font
            drawWrappingWords(
              ctx,
              texts[index].split(this.props.language === "english" ? " " : ""),
              1,
              this.props.text_style,
              this.props.language,
              this.state.placements[index],
              true
            );
          }
        });
  
        // remove listener
        elmnt.removeEventListener(
          media.is_video ? "loadeddata" : "load",
          _listener
        );
      };
      elmnt.addEventListener(media.is_video ? "loadeddata" : "load", _listener);
    };
  
    // --- MEDIA MODEL
    toggleMediaModal = anim => {
      this.setState({ showMediaModal: !this.state.showMediaModal });
    };
  
    // --- MEDIA SELECT
    onMediaSelected = index => {
      this.setState({ showMediaModal: false });
      this.props.onMediaChange(this.props.scene, index);
    };
  
    // --- EDIT TEXT
    onEditText = () => {
      // NOTE: set internal state only, scenes object not yet change.
      this.setState({
        isEditing: true
      });
      this.setup();
    };
  
    // --- EDIT TEXT
    onChangePlacement = (index, alignment) => {
      this.setState(state => {
        const placements = state.placements.map((item, j) => {
          if (j === index) {
            return alignment + "-" + item.split("-")[1];
          } else {
            return item;
          }
        });
  
        return {
          placements
        };
      });
      this.setup();
    };
  
    onConfirmText = () => {
      // NOTE: set state outside, scenes object changed.
      this.props.onTextChange(
        this.props.scene,
        this.state.texts,
        this.state.placements
      );
      this.setState({
        isEditing: false
      });
      this.setup();
    };
  
    onChangeText = (index, e) => {
      let newText = e.target.value;
      // console.log(newText);
      this.setState(state => {
        const texts = state.texts.map((item, j) => {
          if (j === index) {
            return newText;
          } else {
            return item;
          }
        });
  
        return {
          texts
        };
      });
    };
  
    render() {
      // console.log("render");
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: "30px"
          }}
        >
          {/* ----- controls ----- */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginRight: "10px"
            }}
          >
            {/* ----- up ----- */}
            {/* disable if its FIRST scene */}
            <div>
              <Button
                disabled={this.props.index === 0 || this.state.isEditing}
                onClick={() => this.props.onRearrange(this.props.scene, true)}
                className="btn-round btn-icon animation-on-hover"
              >
                <i className="tim-icons icon-minimal-up" />
              </Button>
            </div>
            {/* ----- position ----- */}
            {this.props.scene.position + 1}
            {/* ----- down ----- */}
            {/* disable if its LAST scene */}
            <div>
              <Button
                disabled={
                  this.props.index === this.props.scenes.length - 1 ||
                  this.state.isEditing
                }
                onClick={() => this.props.onRearrange(this.props.scene, false)}
                className="btn-round btn-icon animation-on-hover"
              >
                <i className="tim-icons icon-minimal-down" />
              </Button>
            </div>
            {/* ----- remove ----- */}
            <Button
              onClick={() => this.props.onRemoveScene(this.props.scene)}
              disabled={this.state.isEditing}
              color="danger"
              className="btn-icon animation-on-hover"
            >
              <i className="tim-icons icon-trash-simple" />
            </Button>
          </div>
          {/* ----- canvas ----- */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            {this.state.texts.map((text, index) => {
              let placement = this.state.placements[index];
              let alignment = placement.split("-")[0];
              return (
                <div key={"sc_" + index} style={{ position: "relative" }}>
                  {/* ----- thumbnail ----- */}
                  <canvas
                    width={MAX_WIDTH / SCALE_PREVIEW}
                    height={MAX_HEIGHT / SCALE_PREVIEW}
                    id={index}
                    ref={index}
                  />
                  {/* ----- edit ----- */}
                  <FormGroup
                    style={{
                      position: "absolute",
                      top: 20,
                      left: 20,
                      display: this.state.isEditing ? "block" : "none"
                    }}
                  >
                    {/* ----- edit textarea ----- */}
                    <textarea
                      style={{
                        width: S_MAX_WIDTH - 40,
                        height: S_MAX_HEIGHT - 60,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        textAlign: { alignment }
                      }}
                      ref="text_edit"
                      onChange={e => this.onChangeText(index, e)}
                      value={text}
                      className="form-control"
                    />
  
                    {/* ----- placement buttons ----- */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between"
                      }}
                    >
                      <Button
                        onClick={() => this.onChangePlacement(index, "left")}
                        color={alignment === "left" ? "" : "success"}
                        size="sm"
                      >
                        left
                      </Button>
                      <Button
                        onClick={() => this.onChangePlacement(index, "center")}
                        color={alignment === "center" ? "" : "success"}
                        size="sm"
                      >
                        center
                      </Button>
                      <Button
                        onClick={() => this.onChangePlacement(index, "right")}
                        color={alignment === "right" ? "" : "success"}
                        size="sm"
                      >
                        right
                      </Button>
                    </div>
                  </FormGroup>
                </div>
              );
            })}
          </div>
  
          {/* ----- video ----- */}
          <video
            id="s_v"
            ref="s_v"
            style={{ visibility: "hidden", position: "absolute" }}
            controls
            loop
          />
          {/* ----- image ----- */}
          <img
            id="s_img"
            ref="s_img"
            style={{ visibility: "hidden", position: "absolute" }}
            alt=""
          />
          {/* ----- right ----- */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              marginLeft: "10px"
            }}
          >
            {/* ----- duration ----- */}
            <input
              type="number"
              value={this.props.scene.duration}
              onChange={e => this.props.onDurationChange(this.props.scene, e)}
              min="1"
              max="100"
              className="form-control"
            />
            {"second(s)"}
            <br />
            {/* ----- media ----- */}
            <Button
              ref="media_btn"
              onClick={this.toggleMediaModal}
              disabled={this.state.isEditing}
              style={{ marginLeft: "4px" }}
              color="primary"
              className="btn-icon animation-on-hover"
            >
              <i className="tim-icons icon-image-02" />
            </Button>
            {/* ----- edit text ----- */}
            <Button
              onClick={this.onEditText}
              style={{ display: this.state.isEditing ? "none" : "block" }}
              color="primary"
              className="btn-round btn-icon animation-on-hover"
            >
              <i className="tim-icons icon-pencil" />
            </Button>
            <Button
              onClick={this.onConfirmText}
              style={{ display: this.state.isEditing ? "block" : "none" }}
              color="primary"
              className="btn-round btn-icon animation-on-hover"
            >
              <i className="tim-icons icon-check-2" />
            </Button>
          </div>
  
          {/* ----- media modal----- */}
          <Modal
            isOpen={this.state.showMediaModal}
            toggle={this.toggleMediaModal}
            size="lg"
          >
            <ModalHeader
              className="justify-content-center"
              toggle={this.toggleMediaModal}
            >
              Media
            </ModalHeader>
            <ModalBody className="justify-content-center">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  flexWrap: "wrap"
                }}
              >
                {this.props.scene.medias.map((media, index) => {
                  if (media.is_video) {
                    return (
                      <div
                        key={index + "_media"}
                        style={{
                          margin: "10px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center"
                        }}
                      >
                        <video
                          src={media.url}
                          controls
                          width={MAX_WIDTH / SCALE_PREVIEW / 2}
                          height={MAX_HEIGHT / SCALE_PREVIEW / 2}
                        >
                          <source src={media.url} />
                        </video>
                        <Button
                          size="sm"
                          onClick={() => this.onMediaSelected(index)}
                        >
                          Select
                        </Button>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={index + "_media"}
                        style={{
                          margin: "10px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center"
                        }}
                      >
                        <img
                          src={media.url}
                          width={MAX_WIDTH / SCALE_PREVIEW / 2}
                          height={MAX_HEIGHT / SCALE_PREVIEW / 2}
                          alt="thumbnail"
                        />
                        <Button
                          size="sm"
                          onClick={() => this.onMediaSelected(index)}
                        >
                          Select
                        </Button>
                      </div>
                    );
                  }
                })}
              </div>
            </ModalBody>
          </Modal>
        </div>
      );
    }
  }

// wrap words
const drawWrappingWords = (
    context,
    words,
    t_alpha,
    style_num,
    language,
    placement,
    is_thumbnail
  ) => {
    var font_size = is_thumbnail ? S_FONT_SIZE : FONT_SIZE,
      word_margin = is_thumbnail ? S_WORD_MARGIN : WORD_MARGIN,
      max_width = is_thumbnail ? S_MAX_WIDTH : MAX_WIDTH,
      max_height = is_thumbnail ? S_MAX_HEIGHT : MAX_HEIGHT;
  
    var x = word_margin,
      y = word_margin + font_size, // top margin to word size (align by work baseline)
      maxWidth = max_width - word_margin * 2 - max_width / 4, // width - left right margin - right margin,
      lineHeight = font_size + font_size,
      line = "",
      count = 0,
      top = y,
      hrzntl_point,
      vrtcl_point,
      alignment,
      anim1_x,
      anim1_thickness = is_thumbnail ? 4 / SCALE_PREVIEW : 4,
      anim1_margin = is_thumbnail ? 10 / SCALE_PREVIEW : 10;
  
    switch (placement) {
      case "left-top":
        alignment = "left";
        hrzntl_point = word_margin;
        anim1_x = hrzntl_point - anim1_margin;
        break;
      case "center-top":
        alignment = "center";
        hrzntl_point = max_width / 2;
        break;
      case "right-top":
        alignment = "right";
        hrzntl_point = max_width - word_margin;
        anim1_x = hrzntl_point + anim1_margin;
        break;
    }
  
    context.shadowColor = "rgba(0,0,0,0.3)";
    context.shadowBlur = 4;
  
    var max_word_width = 0;
    for (var n = 0; n < words.length; n++) {
      var space = language === "english" ? " " : "";
      var testLine = line + words[n] + space;
      var metrics = context.measureText(testLine);
      var textWidth = metrics.width;
      if (textWidth > maxWidth && n > 0) {
        context.fillStyle = "RGBA(255,255,255," + t_alpha + ")";
        context.textAlign = alignment;
        context.fillText(line, hrzntl_point, y); // draw text
        count += 1;
        line = words[n] + space;
        y += lineHeight;
      } else {
        line = testLine;
        max_word_width = Math.max(textWidth, max_word_width);
        // -- animation 2
        if (style_num === 2) {
          var x_point = 0;
          context.fillStyle = "#000";
          switch (alignment) {
            case "left":
              x_point = word_margin - 3;
              break;
            case "center":
              x_point = (max_width - textWidth) / 2;
              break;
            case "right":
              x_point = max_width - textWidth - word_margin;
              break;
          }
          context.fillRect(
            x_point,
            y - font_size - 4,
            textWidth * t_alpha + 4,
            font_size + 10
          );
        }
      }
    }
    // -- animation 2
    var textWidth = context.measureText(line).width;
    if (style_num === 2) {
      // context.fillStyle = "#333300";
      var x_point = 0;
      context.fillStyle = "#000";
      switch (alignment) {
        case "left":
          x_point = word_margin - 3;
          break;
        case "center":
          x_point = (max_width - textWidth) / 2 - 4;
          break;
        case "right":
          x_point = max_width - textWidth - word_margin - 4;
          break;
      }
      context.fillRect(
        x_point,
        y - font_size - 4,
        textWidth * t_alpha + 4,
        font_size + 10
      );
    }
    context.fillStyle = "RGBA(255,255,255," + t_alpha + ")";
    context.textAlign = alignment;
    context.fillText(line, hrzntl_point, y); // draw text
    max_word_width = Math.max(textWidth, max_word_width);
  
    // -- animation 1
    if (style_num === 1) {
      count += 1;
      var max_height = count * lineHeight - font_size / 2;
      context.fillStyle = "#ffff66";
      if (alignment !== "center") {
        context.fillRect(
          anim1_x,
          top - font_size,
          anim1_thickness,
          max_height * t_alpha
        );
      } else {
        context.fillRect(
          (max_width - max_word_width) / 2,
          word_margin - 10,
          max_word_width * t_alpha,
          anim1_thickness
        );
      }
    }
  };

export default Scene;