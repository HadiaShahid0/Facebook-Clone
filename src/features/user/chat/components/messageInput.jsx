import { useState } from "react";
import { Send } from "react-feather";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    await onSend(text.trim());

    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-top">
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button type="submit" className="btn btn-primary">
          <Send size={17} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
