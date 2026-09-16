const StatCard = ({ title, value, Icon, text }) => {
  return (
    <div className="card border-0 shadow-sm rounded-4 h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start">

          <div>
            <p className="text-muted mb-2">
              {title}
            </p>

            <h3 className="fw-bold mb-1">
              {value}
            </h3>

            <small className="text-muted">
              {text}
            </small>
          </div>

          <div
            className="bg-primary bg-opacity-10 text-primary rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: "45px",
              height: "45px",
            }}
          >
            <Icon size={22} color="white" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default StatCard;