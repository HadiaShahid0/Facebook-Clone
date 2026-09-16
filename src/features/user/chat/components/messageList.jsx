import { useEffect, useRef } from "react";

const MessageList = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div
      className="flex-grow-1 p-3"
      style={{
        overflowY: "auto",
        background: "#f5f6f7",
      }}
    >
      {messages.length === 0 ? (
        <div className="h-100 d-flex justify-content-center align-items-center">
          <p className="text-muted">No messages yet. Start the conversation.</p>
        </div>
      ) : (
        messages.map((message) => {
          const isMine = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={`d-flex mb-2 ${
                isMine ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-3 ${
                  isMine ? "bg-primary text-white" : "bg-white border"
                }`}
                style={{
                  maxWidth: "70%",
                }}
              >
                <div>{message.text}</div>

                {message.created_at && (
                  <div
                    className={`small mt-1 ${
                      isMine ? "text-white-50" : "text-muted"
                    }`}
                    style={{ fontSize: "11px" }}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
