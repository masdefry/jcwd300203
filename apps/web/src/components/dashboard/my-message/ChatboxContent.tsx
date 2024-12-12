import SingleChatboxReply from "./SingleChatboxReply";

const ChatboxContent = () => {
  return (
    <>
      <div className="inbox_chatting_box">
        <ul className="chatting_content">
          <SingleChatboxReply />
        </ul>
      </div>
      {/* End inbox_chatting_box */}

      <div className="mi_text">
        <div className="message_input">
          <form className="form-inline position-relative">
            <textarea
              className="form-control"
              placeholder="Enter text here..."
              cols={20}
              rows={1}
              wrap="hard"
              required
            />
            <button className="btn" type="submit">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatboxContent;
