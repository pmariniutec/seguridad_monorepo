import React, { Component } from "react";
import moment from "moment";

export default class MessageBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgText: "",
    };
    this.sendMessageToServer = this.sendMessageToServer.bind(this);
  }

  handleMessageText(e) {
    this.setState({ msgText: e.target.value });
  }

  sendMessageToServer() {
    if (this.state.msgText) {
      let msgObj = {
        message: this.state.msgText,
        date: moment().format("LT"),
      };
      this.props.setNewMsgObj(msgObj);
    }
    this.setState({ msgText: "" });
  }

  addMessagesToChat() {
    if (this.props.messages) {
      const msgContent = this.props.messages.map(
        function (message) {
          if (message.receiverid === this.props.selectedUser._id)
            return (
              <div
                key={message.messageId}
                className="outgoing w-3/4 justify-end float-right flex my-2"
              >
                <div className=" w-max bg-gray-200 text-black shadow-lg clear-both p-2 rounded-md">
                  {message.message}
                </div>
                <div className="w-16 rounded-full relative h-16 mx-2 px-2">
                  <img
                    className="profile-picture absolute h-full object-cover self-center p-2"
                    src={"/images/" + this.props.loggedInUserDP}
                    alt="dp"
                  />
                </div>
              </div>
            );
          else
            return (
              <div key={message.messageId} className="incoming w-3/4 flex my-2">
                <div className="w-16 rounded-full relative h-16 mx-2 px-2">
                  <img
                    className="profile-picture absolute h-full object-cover self-center p-2"
                    src={"/images/" + this.props.selectedUser.img}
                    alt="dp"
                  />
                </div>
                <div className=" w-max bg-gray-900 text-white shadow-lg clear-both p-2 rounded-md">
                  {message.message}
                </div>
              </div>
            );
        }.bind(this)
      );
      return msgContent;
    }
  }

  render() {
    return (
      <div className="message-box w-3/5">
        <div className=" w-full relative h-full grid grid-flow-rows">
          <div className="user-bar flex w-full py-4 absolute inset-x-0 top-0 shadow-lg">
            <div className="w-12 rounded-full relative h-12 text-center mx-2">
              <img
                className="profile-picture absolute h-full object-cover self-center p-2"
                src={"/images/" + this.props.selectedUser.img}
                alt="dp"
              />
            </div>
            <div className="contact-name font-bold w-3/4 float-left py-2">
              {this.props.selectedUser.name}
            </div>
          </div>
          <div className="message-area clearfix overflow-auto my-20 p-2">
            {this.addMessagesToChat()}
          </div>
          <div className="input-box flex p-4 bottom-0 absolute inset-x-0 bg-white shadow-inner">
            <input
              className="msg-input p-2 w-4/5 float-left text-sm focus:outline-none focus:ring"
              placeholder="Write Message.."
              value={this.state.msgText}
              onChange={(e) => this.handleMessageText(e)}
            ></input>
            <button
              className="rounded-full focus:outline-none place-self-center transform hover:scale-110 motion-reduce:transform-none"
              onClick={() => this.sendMessageToServer()}
            >
              <i className="lar la-paper-plane m-4 text-xl mx-4"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
